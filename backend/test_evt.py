"""The evt_ builders, on hand-made rows shaped like pymysql returns them (no database)."""

from datetime import date, datetime, timedelta

from app import evt


def t(h, m=0):
    return timedelta(hours=h, minutes=m)


def rows(**over):
    base = {
        "event": [{"id": 1, "name": "Silver Horizons", "start_date": date(2026, 12, 3), "end_date": date(2026, 12, 5)}],
        "activities": [
            {"id": 1, "name": "Arrival in Manila", "description": "All in Manila.", "audience": "all", "sort_order": 1},
            {"id": 2, "name": "ROYU Tour", "description": "Plant tour", "audience": "registered", "sort_order": 2},
            {"id": 5, "name": "Zen Office Tour", "description": "Open to all.", "audience": "all", "sort_order": 5},
            {"id": 6, "name": "Silver Horizons Night", "description": "The night", "audience": "all", "sort_order": 6},
        ],
        "sessions": [
            {"id": 1, "activity_id": 1, "date": date(2026, 12, 3), "start_time": None, "end_time": None, "label": "By December 3"},
            {"id": 3, "activity_id": 2, "date": date(2026, 12, 3), "start_time": t(12, 30), "end_time": t(17), "label": "Thursday afternoon"},
            {"id": 10, "activity_id": 5, "date": date(2026, 12, 3), "start_time": None, "end_time": None, "label": "Time TBA"},
            {"id": 11, "activity_id": 6, "date": date(2026, 12, 5), "start_time": t(14), "end_time": t(23), "label": None},
        ],
        "sections": [
            {"id": 1, "session_id": 11, "title": "Holy Mass", "start_time": t(16), "end_time": t(17), "sort_order": 2},
            {"id": 2, "session_id": 11, "title": "Registration", "start_time": t(14), "end_time": t(16), "sort_order": 1},
            {"id": 7, "session_id": 3, "title": "Plant Tour Proper", "start_time": t(13, 45), "end_time": t(15, 45), "sort_order": 1},
        ],
        "items": [
            {"session_id": 3, "section_id": None, "kind": "Arrival", "title": "Arrival", "note": None, "place": None, "link": None, "start_time": t(12, 30), "end_time": t(13)},
            {"session_id": 3, "section_id": 7, "kind": "Tour", "title": "First station", "note": "Wires", "place": None, "link": None, "start_time": t(13, 45), "end_time": t(14, 30)},
            {"session_id": 11, "section_id": 2, "kind": "Registration", "title": "Registration", "note": None, "place": None, "link": None, "start_time": t(14), "end_time": t(16)},
            {"session_id": 11, "section_id": 1, "kind": "Mass", "title": "Holy Mass", "note": None, "place": None, "link": None, "start_time": t(16), "end_time": t(16, 45)},
        ],
        "people": [
            {"id": 1, "activity_id": 6, "category": "performers", "group_name": "Headliner", "role": "Headliner", "name": "The Real Headliner", "note": "8:40 PM", "is_secret": 1, "is_featured": 1, "reveal_at": datetime(2026, 12, 5, 20, 40)},
            {"id": 2, "activity_id": 6, "category": "performers", "group_name": "Line-up", "role": "Performer 1", "name": "Unknown yet", "note": None, "is_secret": 1, "is_featured": 0, "reveal_at": None},
            {"id": 4, "activity_id": None, "category": "committee", "group_name": None, "role": "Organizer", "name": "Eva Dy", "note": None, "is_secret": 0, "is_featured": 0, "reveal_at": None},
        ],
        "images": [
            {"id": 1, "file": "east-ocean-palace.webp", "title": "East Ocean Palace", "place": "Parañaque City", "credit": None},
            {"id": 2, "file": None, "title": "Royu Electrical", "place": "Owned by FELCO", "credit": None},
            {"id": 3, "file": "people/eva-dy.webp", "title": "Eva Dy", "place": None, "credit": None},
        ],
        "facts": [
            {"image_id": 2, "fact": "Owned by FELCO."},
            {"image_id": 2, "fact": "Two decades."},
        ],
        "links": [
            {"image_id": 1, "entity_type": "activity", "entity_id": 6},
            {"image_id": 2, "entity_type": "activity", "entity_id": 2},
            {"image_id": 3, "entity_type": "person", "entity_id": 4},
            {"image_id": 3, "entity_type": "person", "entity_id": 1},  # the headliner's photo (stand-in)
        ],
    }
    base.update(over)
    return base


def test_time_ranges():
    assert evt.time_range(t(8), t(12, 45)) == "8:00 AM – 12:45 PM"
    assert evt.time_range(t(12, 30), t(17)) == "12:30 – 5:00 PM"
    assert evt.time_range(None, None) is None


def test_itinerary_days_parts_and_order():
    days = evt.build_itinerary(rows(), {"2026-12-03": "Welcome to Manila"})
    assert [d["date"] for d in days] == ["2026-12-03", "2026-12-05"]
    dec3, dec5 = days
    assert dec3["title"] == "Welcome to Manila"
    assert dec5["title"] == "Silver Horizons Night"  # no day title: the first activity's name
    # untimed Arrival leads the day; untimed Zen (TBA) goes last; timed parts in between
    assert [p["title"] for p in dec3["parts"]] == ["Arrival in Manila", "ROYU Tour", "Zen Office Tour"]
    royu = dec3["parts"][1]
    assert royu["tag"] == "Registered participants · Afternoon run"
    assert royu["range"] == "12:30 – 5:00 PM"
    assert royu["stops"][1]["title"] == "Plant Tour Proper: First station"  # a section inside a part
    assert royu["stops"][1]["time"] == "13:45"
    assert royu["images"][0]["image"] is None and royu["images"][0]["facts"] == ["Owned by FELCO.", "Two decades."]
    assert dec3["parts"][2]["range"] == "Time TBA"


def test_night_sections_become_parts():
    night = evt.build_itinerary(rows(), {})[1]
    assert [p["title"] for p in night["parts"]] == ["Registration", "Holy Mass"]  # by sort_order
    assert night["parts"][0]["images"][0]["image"] == "east-ocean-palace"  # the activity's photo on its first part
    assert night["parts"][1]["images"] == []
    assert night["pills"] == ["2:00 – 11:00 PM"]


def test_inactive_parent_hides_children():
    r = rows()
    r["activities"] = [a for a in r["activities"] if a["id"] != 2]  # ROYU deactivated (filtered by the query)
    titles = [p["title"] for p in evt.build_itinerary(r, {})[0]["parts"]]
    assert "ROYU Tour" not in titles


BEFORE = datetime(2026, 12, 5, 20, 0)
AFTER = datetime(2026, 12, 5, 20, 41)


def test_people_groups_event_wide_first():
    whole, night = evt.build_people(rows(), BEFORE)
    assert whole["title"] == "Silver Horizons" and whole["committee"][0]["name"] == "Eva Dy"  # activity_id NULL
    assert whole["when"] == "Dec 3–5"
    assert whole["committee"][0]["image"] == "people/eva-dy"
    assert night["title"] == "Silver Horizons Night" and night["when"] == "Sat, Dec 5"
    assert night["attending"] == []  # guests not applied yet


def test_secret_until_reveal_at():
    head, tba = evt.build_people(rows(), BEFORE)[1]["performers"]
    assert head == {"name": "To be revealed", "group": "Headliner", "role": "Headliner", "note": "8:40 PM",
                    "secret": True, "spotlight": True, "image": None}  # no name, no photo leaves the server
    assert tba["secret"] and tba["name"] == "To be revealed"
    head, tba = evt.build_people(rows(), AFTER)[1]["performers"]
    assert head["name"] == "The Real Headliner" and head["image"] == "people/eva-dy" and not head["secret"]
    assert head["spotlight"]  # featured stays big after the reveal
    assert tba["secret"]  # no reveal_at: secret until is_secret is cleared


def test_featured_is_explicit():
    r = rows()
    r["people"][0]["is_featured"] = 0
    assert not evt.build_people(r, AFTER)[1]["performers"][0]["spotlight"]
    r["people"].append({"id": 9, "activity_id": 6, "category": "hosts", "group_name": "Hosts", "role": "Host",
                        "name": "Ana", "note": None, "is_secret": 0, "is_featured": 1, "reveal_at": None})
    assert evt.build_people(r, AFTER)[1]["hosts"][0]["spotlight"]  # any person, secret or not


def test_people_before_new_columns_exist():
    r = rows()
    for p in r["people"]:
        p.pop("is_featured"); p.pop("reveal_at")
    head = evt.build_people(r, AFTER)[1]["performers"][0]
    assert head["secret"] and not head["spotlight"]  # works on the first table version too
