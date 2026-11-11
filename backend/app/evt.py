"""The event data in felco_op's `evt_` tables, shaped the way the site shows it.

load(event_id) reads the rows (read-only, active rows only); build_itinerary / build_people turn them into the
site's itinerary days and People events. The builders are plain functions of rows, so they're tested without a
database. Guests and assignments aren't applied yet: everyone sees every session.
"""

import os
from collections import defaultdict
from datetime import date, datetime, timedelta

import pymysql
from pymysql.cursors import DictCursor


def connect():
    """A read-only connection to felco_op (settings in backend/.env)."""
    con = pymysql.connect(
        host=os.environ["DB_FELCO_OP_HOST"],
        port=int(os.environ.get("DB_FELCO_OP_PORT", "3306")),
        user=os.environ["DB_FELCO_OP_USERNAME"],
        password=os.environ["DB_FELCO_OP_PASSWORD"],
        database=os.environ["DB_FELCO_OP_DATABASE"],
        charset="utf8mb4",
        cursorclass=DictCursor,
        connect_timeout=10,
        read_timeout=30,
    )
    with con.cursor() as cur:
        cur.execute("SET SESSION TRANSACTION READ ONLY")
    return con


# one query per table, active rows only; an inactive parent hides its children in the builders
QUERIES = {
    "event": "SELECT * FROM evt_events WHERE id = %(e)s AND is_active = 1",
    "activities": "SELECT * FROM evt_activities WHERE event_id = %(e)s AND is_active = 1 ORDER BY sort_order, id",
    "sessions": """SELECT s.* FROM evt_sessions s JOIN evt_activities a ON a.id = s.activity_id
                   WHERE a.event_id = %(e)s AND s.is_active = 1 AND a.is_active = 1
                   ORDER BY s.date, s.start_time, s.id""",
    "sections": """SELECT x.* FROM evt_sections x JOIN evt_sessions s ON s.id = x.session_id
                   JOIN evt_activities a ON a.id = s.activity_id
                   WHERE a.event_id = %(e)s AND x.is_active = 1 ORDER BY x.sort_order, x.id""",
    "items": """SELECT i.* FROM evt_items i JOIN evt_sessions s ON s.id = i.session_id
                JOIN evt_activities a ON a.id = s.activity_id
                WHERE a.event_id = %(e)s AND i.is_active = 1 ORDER BY i.session_id, i.sort_order, i.id""",
    "people": "SELECT * FROM evt_people WHERE event_id = %(e)s AND is_active = 1 ORDER BY category, sort_order, id",
    "images": "SELECT * FROM evt_images WHERE is_active = 1",
    "facts": "SELECT * FROM evt_image_facts WHERE is_active = 1 ORDER BY image_id, sort_order, id",
    "links": "SELECT * FROM evt_image_links WHERE is_active = 1 ORDER BY entity_type, entity_id, sort_order, id",
}


def load(event_id: int) -> dict:
    con = connect()
    try:
        with con.cursor() as cur:
            rows = {}
            for name, sql in QUERIES.items():
                cur.execute(sql, {"e": event_id})
                rows[name] = cur.fetchall()
            return rows
    finally:
        con.close()


# ---- formatting -------------------------------------------------------------------------------------------

def hhmm(t) -> str | None:
    """MySQL TIME (a timedelta from pymysql) → 'HH:MM'."""
    if t is None:
        return None
    if isinstance(t, timedelta):
        minutes = int(t.total_seconds()) // 60
        return f"{minutes // 60:02d}:{minutes % 60:02d}"
    return str(t)[:5]


def clock(t: str) -> tuple[str, str]:
    h, m = map(int, t.split(":"))
    return f"{h % 12 or 12}:{m:02d}", "AM" if h < 12 else "PM"


def time_range(start, end) -> str | None:
    """'08:00', '12:45' → '8:00 AM – 12:45 PM'; same half of the day → '12:30 – 5:00 PM'."""
    s, e = hhmm(start), hhmm(end)
    if not s:
        return None
    (st, sm) = clock(s)
    if not e:
        return f"{st} {sm}"
    (et, em) = clock(e)
    return f"{st} – {et} {em}" if sm == em else f"{st} {sm} – {et} {em}"


def iso(d) -> str:
    return d.isoformat() if isinstance(d, date) else str(d)


# ---- images -----------------------------------------------------------------------------------------------

def images_for(rows: dict) -> dict:
    """(entity_type, entity_id) → [{image, title, place, facts}] in link order. `image` is the asset name the site
    maps to a bundled file ('fine-arts', 'people/eva-dy'); None = placeholder slide."""
    images = {r["id"]: r for r in rows["images"]}
    facts = defaultdict(list)
    for f in rows["facts"]:
        facts[f["image_id"]].append(f["fact"])
    out = defaultdict(list)
    for link in rows["links"]:
        im = images.get(link["image_id"])
        if not im:
            continue
        out[(link["entity_type"], link["entity_id"])].append({
            "image": im["file"].rsplit(".", 1)[0] if im["file"] else None,
            "title": im["title"],
            "place": im["place"],
            "facts": facts[im["id"]],
            "credit": im["credit"],
        })
    return out


# ---- itinerary --------------------------------------------------------------------------------------------

def tag(activity: dict, session: dict) -> str:
    """Who it's for, as the part's small pill: 'Open to all', 'Registered participants · Afternoon run', 'Morning slot'."""
    when = (session["label"] or "").split()[-1:]  # 'Thursday afternoon' → 'afternoon'
    when = when[0].capitalize() if when else ""
    if activity["audience"] == "all":
        return "Open to all"
    if activity["audience"] == "registered":
        return f"Registered participants · {when} run" if when else "Registered participants"
    return f"{when} slot" if when else "Assigned per person"


def stop(item: dict, prefix: str | None = None) -> dict:
    return {
        "time": hhmm(item["start_time"]),
        "end": hhmm(item["end_time"]),
        "type": item["kind"],
        "title": f"{prefix}: {item['title']}" if prefix else item["title"],
        "note": item["note"],
        "place": item["place"],
        "mapUrl": item["link"],
    }


def build_itinerary(rows: dict, day_titles: dict) -> list:
    activities = {a["id"]: a for a in rows["activities"]}
    sections = defaultdict(list)
    for x in rows["sections"]:
        sections[x["session_id"]].append(x)
    items = defaultdict(list)
    for i in rows["items"]:
        items[i["session_id"]].append(i)
    images = images_for(rows)

    days = defaultdict(list)
    for s in rows["sessions"]:
        if s["activity_id"] in activities:
            days[iso(s["date"])].append(s)

    out = []
    for day, sessions in sorted(days.items()):
        # parts in time order; an untimed session goes first if its activity leads the day (Arrival), else last (TBA)
        first = min(activities[s["activity_id"]]["sort_order"] for s in sessions)
        sessions.sort(key=lambda s: hhmm(s["start_time"]) or ("00:00" if activities[s["activity_id"]]["sort_order"] == first else "99:99"))
        parts = []
        for s in sessions:
            a = activities[s["activity_id"]]
            secs = {x["id"]: x for x in sections[s["id"]]}
            lines = items[s["id"]]
            pics = images[("activity", a["id"])] + images[("session", s["id"])]
            if secs and lines and all(i["section_id"] in secs for i in lines):
                # every line is in a section (the Night): each section is a part of its own
                for k, x in enumerate(sorted(secs.values(), key=lambda x: (x["sort_order"], x["id"]))):
                    parts.append({
                        "title": x["title"],
                        "range": time_range(x["start_time"], x["end_time"]),
                        "images": pics if k == 0 else [],
                        "stops": [stop(i) for i in lines if i["section_id"] == x["id"]],
                    })
            else:
                parts.append({
                    "title": a["name"],
                    "tag": tag(a, s),
                    "range": time_range(s["start_time"], s["end_time"]) or s["label"],
                    "note": a["description"],
                    "images": pics,
                    "stops": [stop(i, secs[i["section_id"]]["title"] if i["section_id"] in secs else None) for i in lines],
                })
        timed = [s for s in sessions if s["start_time"] is not None]
        span = time_range(min(s["start_time"] for s in timed), max(s["end_time"] or s["start_time"] for s in timed)) if timed else None
        names = list(dict.fromkeys(activities[s["activity_id"]]["name"] for s in sessions))
        out.append({
            "date": day,
            "title": day_titles.get(day) or names[0],
            "area": f"{len(names)} {'activity' if len(names) == 1 else 'activities'}",
            "pills": [p for p in [span] if p],
            "parts": parts,
        })
    return out


# ---- people -----------------------------------------------------------------------------------------------

SECRET_NAME = "To be revealed"


def span(start, end) -> str:
    """The event's dates: 'Dec 3–5', 'Dec 30 – Jan 2', or one day."""
    if not isinstance(start, date):
        return ""
    if not isinstance(end, date) or end == start:
        return start.strftime("%a, %b %-d")
    if (start.year, start.month) == (end.year, end.month):
        return f"{start.strftime('%b %-d')}–{end.day}"
    return f"{start.strftime('%b %-d')} – {end.strftime('%b %-d')}"


def build_people(rows: dict, now: datetime) -> list:
    """One entry per activity that has hosts / performers / committee (activity_id NULL = the whole event), as the
    People page lists them. A secret act (is_secret, and reveal_at unset or still ahead of `now`, Manila time) goes
    out as "To be revealed" with no name or photo: anything sent to the browser can be read there, so the real
    name never leaves the server before its time. is_featured = shown as the big spotlight card."""
    activities = {a["id"]: a for a in rows["activities"]}
    first_day = {}
    for s in rows["sessions"]:
        first_day.setdefault(s["activity_id"], s["date"])
    images = images_for(rows)
    events = {}
    for p in rows["people"]:
        a = activities.get(p["activity_id"]) if p["activity_id"] else None
        if p["activity_id"] and not a:
            continue  # its activity is inactive
        key = p["activity_id"] or 0
        if key not in events:
            d = first_day.get(p["activity_id"])
            ev = rows["event"][0] if rows["event"] else {}
            events[key] = {
                "id": f"a{key}",
                "title": a["name"] if a else ev.get("name", "Event"),
                "when": d.strftime("%a, %b %-d") if isinstance(d, date) else span(ev.get("start_date"), ev.get("end_date")),
                "sort": a["sort_order"] if a else -1,
                "attending": [], "hosts": [], "performers": [], "committee": [],
            }
        pics = images[("person", p["id"])]
        reveal_at = p.get("reveal_at")
        secret = bool(p["is_secret"]) and (reveal_at is None or reveal_at > now)
        events[key][p["category"]].append({
            "name": SECRET_NAME if secret else p["name"],
            "group": p["group_name"],
            "role": p["role"],
            "note": p["note"],
            "secret": secret,
            "spotlight": bool(p.get("is_featured")),
            "image": None if secret or not pics else pics[0]["image"],
        })
    return [{k: v for k, v in e.items() if k != "sort"} for e in sorted(events.values(), key=lambda e: e["sort"])]
