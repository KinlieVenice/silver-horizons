# Event backend: data model and personal itinerary (design)

Status: draft for sign-off · Branch: `feat/google-login` · Date: 2026-11-11

## Goal

Make the Silver Horizons site dynamic and per person. A signed-in employee sees only the event they are invited to,
and within it only the runs/slots they are assigned to, plus everything open to all. Organisers manage the data
(guest list, assignments, programmes, photos, people) instead of developers editing files. The model is not
specific to Silver Horizons: any FELCO event can be added as rows.

## Where the data lives

- **Database:** the FELCO OP UAT database `felco_op` (MySQL 5.7.33). Connection settings live only in
  `backend/.env` (git-ignored).
- **Our tables:** new tables prefixed `evt_`, created in `felco_op` (approved). Nothing else in `felco_op` is
  written to.
- **Employees (read-only):** `vw_felco_employees`, used for sign-in eligibility, names, branch (`area`) and
  department. The HR tables (`hcm_federated`, `vw_hcm_emp_masterfile`, …) hold sensitive personal data (SSS, TIN,
  bank accounts, family) and are never read.
- **Recommendation for production:** a dedicated database user limited to `evt_%` tables plus `SELECT` on
  `vw_felco_employees`, instead of the shared `sfa_dev` account (which can drop any table).

## Conventions (every `evt_` table)

- `id BIGINT UNSIGNED AUTO_INCREMENT` primary key (matches the existing `felco_op` tables).
- `is_active TINYINT(1) NOT NULL DEFAULT 1`. **No hard deletes**: deleting means `is_active = 0`.
- Audit: `created_by VARCHAR(100)`, `updated_by VARCHAR(100)` (the signed-in email), `created_at`, `updated_at`
  (`TIMESTAMP`).
- `utf8mb4`, InnoDB; foreign keys between `evt_` tables; dates as `DATE`, times as `TIME` (Manila time), never text.
- No reserved words as column names (no `from`, `to`, `group`).
- `employee_id VARCHAR(11)` everywhere it appears, matching `vw_felco_employees.employee_id` (no foreign key:
  it's a view in another domain of the database).

## Tables

### 1. `evt_events`
`id, name, tagline, venue, city, start_date DATE, end_date DATE, is_active`

### 2. `evt_activities`: what a thing is, entered once
`id, event_id → evt_events, name, description, audience ENUM('all','registered','assigned'), place, sort_order,
is_active`

- `all`: every guest of the event sees it (the Night, Zen Office Tour, Arrival).
- `registered` / `assigned`: a guest sees it only through an assignment to one of its sessions (Royu Tour; the
  FELCO Explores trips).

### 3. `evt_sessions`: each time an activity runs
`id, activity_id → evt_activities, date DATE, start_time TIME NULL, end_time TIME NULL, label, capacity INT NULL,
is_active` · index `(activity_id, date, start_time)`

Royu Tour = 1 activity, 4 sessions (Thu AM, Thu PM, Fri AM, Fri PM). Null times = "Time TBA".

### 4. `evt_sections`: named parts within a session
`id, session_id → evt_sessions, title, start_time TIME NULL, end_time TIME NULL, sort_order, is_active`

The Night's six parts (Registration & Pre-event … After Party); Royu's "Plant Tour Proper".

### 5. `evt_items`: the programme lines
`id, session_id → evt_sessions, section_id → evt_sections NULL, kind, title, note, place, link, start_time TIME
NULL, end_time TIME NULL, sort_order, is_active` · index `(session_id, sort_order)`

`kind` is the small label the site shows (Assembly, Transportation, Raffle, …). `sort_order` decides the order
(times can overlap: Performer 1 runs during Dinner).

### 6. `evt_images`
`id, file VARCHAR NULL, title, place, credit, is_active`

`file` null = a designed placeholder (title in chrome) until a photo exists.

### 7. `evt_image_facts`
`id, image_id → evt_images, fact TEXT, sort_order, is_active` · index `(image_id, sort_order)`

### 8. `evt_image_links`: one polymorphic pivot for every module
`id, image_id → evt_images, entity_type ENUM('event','activity','session','item','person'), entity_id, sort_order,
is_active` · unique `(image_id, entity_type, entity_id)` · index `(entity_type, entity_id, sort_order)`

`entity_id` has no foreign key (it points at a different table per row); the ENUM keeps types consistent, and the
backend deactivates an entity's links when it deactivates the entity. A new module = one new ENUM value.

### 9. `evt_guests`: who is invited
`id, event_id → evt_events, employee_id, status ENUM('invited','confirmed','declined'), is_active` · unique
`(event_id, employee_id)`

### 10. `evt_assignments`: who is in which session
`id, session_id → evt_sessions, employee_id, group_code NULL, is_active` · unique `(session_id, employee_id)`

`group_code`: an optional team/bus label.

### 11. `evt_people`: hosts, speakers, performers, committee
`id, event_id → evt_events, activity_id → evt_activities NULL (null = whole event), category
ENUM('hosts','performers','committee'), group_name NULL, role, name, employee_id NULL, note, is_secret TINYINT(1),
is_featured TINYINT(1), reveal_at DATETIME NULL, sort_order, is_active`

Photos come through `evt_image_links` (`entity_type = 'person'`). With `employee_id` set, the name shown comes from
`vw_felco_employees`. Groups (Headliner, Line-up, Hosts, Speakers, Guides) are ordered by the first `sort_order` in
each group. The committee organises the whole event (`activity_id` NULL).

- **Surprises:** the real name and photo can be entered ahead of time with `is_secret = 1`. Until `reveal_at`
  (Manila time; NULL = until `is_secret` is cleared) the server sends only "To be revealed", with no name and no
  photo, because anything sent to the browser can be read there. The reveal shows within the content cache time.
- **Display:** `is_featured = 1` = the big spotlight card (any person, secret or not); the site never guesses it
  from a group's name.

## Soft-delete rules

1. Every read filters `is_active = 1` on every table in the join (one shared query helper, so none forgets).
2. Deactivating cascades to dependants: activity → its sessions → their sections and items; any entity → its image
   links. Reactivating restores them.
3. Re-adding something that exists inactive reactivates that row (the unique keys stay strict).
4. Admin pages hide inactive rows by default, with a "Show inactive" toggle.

## Who sees what

- **Sign-in:** a verified Google account on an allowed domain (`ALLOWED_DOMAINS`, now `fireflyelectric.com`; one
  line to add `royuindustrial.com`) **and** present in `vw_felco_employees` by email.
- **Itinerary** (`GET /api/itinerary?event=…`): the events the person is a guest of; per day, every `all` activity's
  sessions plus the sessions they are assigned to, each with its sections, items, images and facts.
  Not a guest of any event → "You're not on the guest list".
- **People** (`GET /api/people?event=…`): per event the person attends, the attendees of the sessions they share
  (name and branch from the view) and the hosts, performers and committee.
- **Admins:** emails in `ADMIN_EMAILS` (config).

## Phase 1 (this build)

1. Tables via versioned migrations (Alembic, its version table named `evt_alembic_version`).
2. Seed script: loads everything in `backend/app/content.json` into the `evt_` tables (no retyping).
3. The personal itinerary and People endpoints above; the site switches from `content.json` to them.
4. Admin `/admin`: upload the guest list as CSV (`email, royu_session, explore_session, group_code`), matched to
   employees by email; a preview listing errors (unknown email, unknown session, over capacity, double-booked
   times) before anything is saved; then a view of who is assigned where.

## Phase 2 (after)

Admin forms to edit events, activities, sessions, sections, items, images, facts and people.

## Testing

- Backend tests against a throwaway MySQL-compatible database (never `felco_op`): seed → personal itinerary for a
  guest with and without assignments; soft-delete cascade and reactivation; CSV preview errors; sign-in refused for
  someone not in the employee view.
- Read-only smoke test against `felco_op` UAT once tables exist.

## Later additions (planned, not built)

- **Several events per person:** already supported by the tables (`evt_guests` is per person per event). The site
  will show the signed-in person's events that haven't ended (`end_date`), a chooser when there are several, and
  past events read-only.
- **QR check-in:** `evt_guests.status` stays RSVP only. Each invitation gets a random `qr_token` (a new column on
  `evt_guests`, regenerated to revoke); each scan is a row in a new `evt_checkins` (session, employee, time, method
  `qr`/`manual`, who scanned, `is_active` to undo), since attendance is per session, not per guest.

## Open questions

- Production database user with limited rights (see above): who creates it?
- Is `royuindustrial.com` allowed to sign in now or later?
- CSV columns: confirm with the organisers how they track the Royu run and the Explores slot per person.
