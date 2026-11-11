# `evt_` tables: schema and seed data (MySQL 5.7)

Creates the 11 `evt_` tables in `felco_op` and loads Silver Horizons as it stands on the site today. Generated from
the site's data (`backend/app/content.json`) and the official schedules; see
`docs/superpowers/specs/2026-11-11-event-backend-design.md` for the design.

**Before you run it**

- Run it against **`felco_op`** (UAT) as a user that can create tables. It only creates `evt_` tables and inserts
  into them; nothing else in the database is touched.
- Part 1 (schema) is safe to run once. If any `evt_` table already exists it stops with an error rather than
  overwriting it.
- Part 2 (seed) runs in one transaction: all rows go in, or none.
- `evt_guests` and `evt_assignments` are left empty on purpose (no real guest list yet); see the commented example
  at the end.
- `evt_images.file` is a file name in the site's assets (`frontend/src/assets/photos/…`, `…/people/…`); `NULL` means a
  placeholder slide. Committee `employee_id`s are left `NULL`: fill them from `vw_felco_employees` once confirmed.

**Rows loaded**

| table | rows |
|---|---|
| `evt_events` | 1 |
| `evt_activities` | 6 |
| `evt_sessions` | 11 |
| `evt_sections` | 10 |
| `evt_items` | 78 |
| `evt_images` | 27 |
| `evt_image_facts` | 53 |
| `evt_image_links` | 28 |
| `evt_people` | 15 |

## Part 1: schema

```sql
SET NAMES utf8mb4;
CREATE TABLE evt_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255) NULL,
  venue VARCHAR(255) NULL,
  city VARCHAR(255) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_activities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  audience ENUM('all','registered','assigned') NOT NULL DEFAULT 'all',
  place VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evt_activities_event (event_id, sort_order),
  CONSTRAINT fk_evt_activities_event FOREIGN KEY (event_id) REFERENCES evt_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  activity_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  label VARCHAR(100) NULL,
  capacity INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evt_sessions_activity (activity_id, date, start_time),
  CONSTRAINT fk_evt_sessions_activity FOREIGN KEY (activity_id) REFERENCES evt_activities (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evt_sections_session (session_id, sort_order),
  CONSTRAINT fk_evt_sections_session FOREIGN KEY (session_id) REFERENCES evt_sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id BIGINT UNSIGNED NOT NULL,
  section_id BIGINT UNSIGNED NULL,
  kind VARCHAR(50) NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT NULL,
  place VARCHAR(255) NULL,
  link TEXT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evt_items_session (session_id, sort_order),
  CONSTRAINT fk_evt_items_session FOREIGN KEY (session_id) REFERENCES evt_sessions (id),
  CONSTRAINT fk_evt_items_section FOREIGN KEY (section_id) REFERENCES evt_sections (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  file VARCHAR(255) NULL COMMENT 'NULL = placeholder slide (title shown in chrome)',
  title VARCHAR(255) NOT NULL,
  place VARCHAR(255) NULL,
  credit VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_image_facts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  image_id BIGINT UNSIGNED NOT NULL,
  fact TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evt_image_facts_image (image_id, sort_order),
  CONSTRAINT fk_evt_image_facts_image FOREIGN KEY (image_id) REFERENCES evt_images (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_image_links (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  image_id BIGINT UNSIGNED NOT NULL,
  entity_type ENUM('event','activity','session','item','person') NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL COMMENT 'id in the table named by entity_type (no FK: polymorphic)',
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_evt_image_links (image_id, entity_type, entity_id),
  KEY idx_evt_image_links_entity (entity_type, entity_id, sort_order),
  CONSTRAINT fk_evt_image_links_image FOREIGN KEY (image_id) REFERENCES evt_images (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_guests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id BIGINT UNSIGNED NOT NULL,
  employee_id VARCHAR(11) NOT NULL COMMENT 'vw_felco_employees.employee_id',
  status ENUM('invited','confirmed','declined') NOT NULL DEFAULT 'invited',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_evt_guests (event_id, employee_id),
  KEY idx_evt_guests_employee (employee_id),
  CONSTRAINT fk_evt_guests_event FOREIGN KEY (event_id) REFERENCES evt_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id BIGINT UNSIGNED NOT NULL,
  employee_id VARCHAR(11) NOT NULL COMMENT 'vw_felco_employees.employee_id',
  group_code VARCHAR(50) NULL COMMENT 'optional team / bus label',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_evt_assignments (session_id, employee_id),
  KEY idx_evt_assignments_employee (employee_id),
  CONSTRAINT fk_evt_assignments_session FOREIGN KEY (session_id) REFERENCES evt_sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evt_people (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id BIGINT UNSIGNED NOT NULL,
  activity_id BIGINT UNSIGNED NULL COMMENT 'NULL = the whole event',
  category ENUM('hosts','performers','committee') NOT NULL,
  group_name VARCHAR(100) NULL,
  role VARCHAR(150) NULL,
  name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(11) NULL COMMENT 'vw_felco_employees.employee_id, when the person is an employee',
  note VARCHAR(255) NULL,
  is_secret TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'shown as To be revealed (no name or photo) until reveal_at',
  is_featured TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = the big spotlight card',
  reveal_at DATETIME NULL COMMENT 'Manila time; NULL = secret until is_secret is cleared',
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_evt_people_event (event_id, category, sort_order),
  CONSTRAINT fk_evt_people_event FOREIGN KEY (event_id) REFERENCES evt_events (id),
  CONSTRAINT fk_evt_people_activity FOREIGN KEY (activity_id) REFERENCES evt_activities (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Part 2: seed data

```sql
SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO evt_events (id, name, tagline, venue, city, start_date, end_date, created_by) VALUES
  (1, 'Silver Horizons', 'Celebrating the Journey, Embracing the Future', 'East Ocean Palace', 'Parañaque City', '2026-12-03', '2026-12-05', 'seed');

INSERT INTO evt_activities (id, event_id, name, description, audience, place, sort_order, created_by) VALUES
  (1, 1, 'Arrival in Manila', 'All employees in Manila by December 3.', 'all', 'Manila', 1, 'seed'),
  (2, 1, 'ROYU Tour', 'Plant tour', 'registered', 'Royu', 2, 'seed'),
  (3, 1, 'FELCO Explores National Museum: Art & History', 'Explore Philippine art, history, and cultural heritage.', 'assigned', 'National Museum of the Philippines, Ermita, Manila', 3, 'seed'),
  (4, 1, 'FELCO Explores Binondo: Flavors & Heritage', 'Discover the culture, heritage, and flavors of Manila''s historic Chinatown.', 'assigned', 'Binondo, Manila', 4, 'seed'),
  (5, 1, 'Zen Office Tour', 'Open to all.', 'all', 'Zen Office, 11th floor', 5, 'seed'),
  (6, 1, 'Silver Horizons Night', 'Celebrating the Journey, Embracing the Future', 'all', 'East Ocean Palace, Parañaque City', 6, 'seed');

INSERT INTO evt_sessions (id, activity_id, date, start_time, end_time, label, capacity, created_by) VALUES
  (1, 1, '2026-12-03', NULL, NULL, 'By December 3', NULL, 'seed'),
  (2, 2, '2026-12-03', '08:00', '12:00', 'Thursday morning', 150, 'seed'),
  (3, 2, '2026-12-03', '12:30', '17:00', 'Thursday afternoon', 150, 'seed'),
  (4, 2, '2026-12-04', '08:00', '12:00', 'Friday morning', 150, 'seed'),
  (5, 2, '2026-12-04', '12:30', '17:00', 'Friday afternoon', 150, 'seed'),
  (6, 3, '2026-12-03', '08:00', '12:45', 'Thursday morning', NULL, 'seed'),
  (7, 3, '2026-12-04', '12:00', '16:45', 'Friday afternoon', NULL, 'seed'),
  (8, 4, '2026-12-03', '12:45', '17:00', 'Thursday afternoon', NULL, 'seed'),
  (9, 4, '2026-12-04', '07:45', '12:00', 'Friday morning', NULL, 'seed'),
  (10, 5, '2026-12-04', NULL, NULL, 'Time TBA', NULL, 'seed'),
  (11, 6, '2026-12-05', '14:00', '23:00', NULL, NULL, 'seed');

INSERT INTO evt_sections (id, session_id, title, start_time, end_time, sort_order, created_by) VALUES
  (1, 11, 'Registration & Pre-event', '14:00', '16:00', 1, 'seed'),
  (2, 11, 'Holy Mass', '16:00', '17:00', 2, 'seed'),
  (3, 11, 'Part 1: Ascent', '17:00', '19:00', 3, 'seed'),
  (4, 11, 'Part 2: Summit', '19:00', '20:30', 4, 'seed'),
  (5, 11, 'Part 3: Beyond the Summit', '20:30', '21:20', 5, 'seed'),
  (6, 11, 'After Party', '21:20', '23:00', 6, 'seed'),
  (7, 2, 'Plant Tour Proper', '09:00', '11:00', 1, 'seed'),
  (8, 3, 'Plant Tour Proper', '13:45', '15:45', 1, 'seed'),
  (9, 4, 'Plant Tour Proper', '09:00', '11:00', 1, 'seed'),
  (10, 5, 'Plant Tour Proper', '13:45', '15:45', 1, 'seed');

INSERT INTO evt_items (id, session_id, section_id, kind, title, note, start_time, end_time, sort_order, created_by) VALUES
  (1, 1, NULL, 'Arrival', 'Travel details to follow', NULL, NULL, NULL, 1, 'seed'),
  (2, 2, NULL, 'Arrival', 'Arrival', NULL, '08:00', '08:30', 1, 'seed'),
  (3, 2, NULL, 'Registration', 'Registration', NULL, '08:30', '08:45', 2, 'seed'),
  (4, 2, NULL, 'Orientation', 'Orientation', 'History, house rules, drafting per team', '08:45', '09:00', 3, 'seed'),
  (5, 2, 7, 'Tour', 'First station', 'Wires, Fab, Plastics (teams rotate)', '09:00', '09:45', 4, 'seed'),
  (6, 2, 7, 'Tour', 'Second station', 'Wires, Fab, Plastics (teams rotate)', '09:45', '10:15', 5, 'seed'),
  (7, 2, 7, 'Tour', 'Third station', 'Wires, Fab, Plastics (teams rotate)', '10:15', '11:00', 6, 'seed'),
  (8, 2, NULL, 'Meal', 'Back to assembly area', 'Lunch distribution', '11:00', '11:45', 7, 'seed'),
  (9, 2, NULL, 'Transportation', 'Departure', NULL, '11:45', '12:00', 8, 'seed'),
  (10, 3, NULL, 'Arrival', 'Arrival', NULL, '12:30', '13:00', 1, 'seed'),
  (11, 3, NULL, 'Registration', 'Registration', NULL, '13:00', '13:15', 2, 'seed'),
  (12, 3, NULL, 'Orientation', 'Orientation', 'History, house rules, drafting per team', '13:15', '13:45', 3, 'seed'),
  (13, 3, 8, 'Tour', 'First station', 'Wires, Fab, Plastics (teams rotate)', '13:45', '14:30', 4, 'seed'),
  (14, 3, 8, 'Tour', 'Second station', 'Wires, Fab, Plastics (teams rotate)', '14:30', '15:15', 5, 'seed'),
  (15, 3, 8, 'Tour', 'Third station', 'Wires, Fab, Plastics (teams rotate)', '15:15', '15:45', 6, 'seed'),
  (16, 3, NULL, 'Meal', 'Back to assembly area', NULL, '15:45', '16:30', 7, 'seed'),
  (17, 3, NULL, 'Transportation', 'Departure', NULL, '16:30', '17:00', 8, 'seed'),
  (18, 4, NULL, 'Arrival', 'Arrival', NULL, '08:00', '08:30', 1, 'seed'),
  (19, 4, NULL, 'Registration', 'Registration', NULL, '08:30', '08:45', 2, 'seed'),
  (20, 4, NULL, 'Orientation', 'Orientation', 'History, house rules, drafting per team', '08:45', '09:00', 3, 'seed'),
  (21, 4, 9, 'Tour', 'First station', 'Wires, Fab, Plastics (teams rotate)', '09:00', '09:45', 4, 'seed'),
  (22, 4, 9, 'Tour', 'Second station', 'Wires, Fab, Plastics (teams rotate)', '09:45', '10:15', 5, 'seed'),
  (23, 4, 9, 'Tour', 'Third station', 'Wires, Fab, Plastics (teams rotate)', '10:15', '11:00', 6, 'seed'),
  (24, 4, NULL, 'Meal', 'Back to assembly area', 'Lunch distribution', '11:00', '11:45', 7, 'seed'),
  (25, 4, NULL, 'Transportation', 'Departure', NULL, '11:45', '12:00', 8, 'seed'),
  (26, 5, NULL, 'Arrival', 'Arrival', NULL, '12:30', '13:00', 1, 'seed'),
  (27, 5, NULL, 'Registration', 'Registration', NULL, '13:00', '13:15', 2, 'seed'),
  (28, 5, NULL, 'Orientation', 'Orientation', 'History, house rules, drafting per team', '13:15', '13:45', 3, 'seed'),
  (29, 5, 10, 'Tour', 'First station', 'Wires, Fab, Plastics (teams rotate)', '13:45', '14:30', 4, 'seed'),
  (30, 5, 10, 'Tour', 'Second station', 'Wires, Fab, Plastics (teams rotate)', '14:30', '15:15', 5, 'seed'),
  (31, 5, 10, 'Tour', 'Third station', 'Wires, Fab, Plastics (teams rotate)', '15:15', '15:45', 6, 'seed'),
  (32, 5, NULL, 'Meal', 'Back to assembly area', NULL, '15:45', '16:30', 7, 'seed'),
  (33, 5, NULL, 'Transportation', 'Departure', NULL, '16:30', '17:00', 8, 'seed'),
  (34, 6, NULL, 'Assembly', 'Assembly @ ZEN', NULL, '08:00', '08:15', 1, 'seed'),
  (35, 6, NULL, 'Transportation', 'Travel to National Museum', NULL, '08:15', '08:30', 2, 'seed'),
  (36, 6, NULL, 'Check-in', 'Check-in to the venue', NULL, '08:30', '09:00', 3, 'seed'),
  (37, 6, NULL, 'Exploration', 'Exploring National Museum of Fine Arts', NULL, '09:00', '10:30', 4, 'seed'),
  (38, 6, NULL, 'Check-in', 'Museum transfer & check-in', NULL, '10:30', '11:00', 5, 'seed'),
  (39, 6, NULL, 'Exploration', 'Exploring National Museum of Natural History', NULL, '11:00', '12:30', 6, 'seed'),
  (40, 6, NULL, 'Transportation', 'Travel back to Zen', NULL, '12:30', '12:45', 7, 'seed'),
  (41, 7, NULL, 'Assembly', 'Assembly @ ZEN', NULL, '12:00', '12:15', 1, 'seed'),
  (42, 7, NULL, 'Transportation', 'Travel to National Museum', NULL, '12:15', '12:30', 2, 'seed'),
  (43, 7, NULL, 'Check-in', 'Check-in to the venue', NULL, '12:30', '13:00', 3, 'seed'),
  (44, 7, NULL, 'Exploration', 'Exploring National Museum of Natural History', NULL, '13:00', '14:30', 4, 'seed'),
  (45, 7, NULL, 'Check-in', 'Museum transfer & check-in', NULL, '14:30', '15:00', 5, 'seed'),
  (46, 7, NULL, 'Exploration', 'Exploring National Museum of Fine Arts', NULL, '15:00', '16:30', 6, 'seed'),
  (47, 7, NULL, 'Transportation', 'Travel back to Zen', NULL, '16:30', '16:45', 7, 'seed'),
  (48, 8, NULL, 'Assembly', 'Assembly @ ZEN', NULL, '12:45', '13:00', 1, 'seed'),
  (49, 8, NULL, 'Transportation', 'Travel to Plaza Lorenzo Ruiz', NULL, '13:00', '13:15', 2, 'seed'),
  (50, 8, NULL, 'Exploration', 'Exploring Binondo', NULL, '13:15', '16:45', 3, 'seed'),
  (51, 8, NULL, 'Transportation', 'Travel back to Zen', NULL, '16:45', '17:00', 4, 'seed'),
  (52, 9, NULL, 'Assembly', 'Assembly @ ZEN', NULL, '07:45', '08:00', 1, 'seed'),
  (53, 9, NULL, 'Transportation', 'Travel to Plaza Lorenzo Ruiz', NULL, '08:00', '08:15', 2, 'seed'),
  (54, 9, NULL, 'Exploration', 'Exploring Binondo', NULL, '08:15', '11:45', 3, 'seed'),
  (55, 9, NULL, 'Transportation', 'Travel back to Zen', NULL, '11:45', '12:00', 4, 'seed'),
  (56, 11, 1, 'Registration', 'Registration and Pre-event', NULL, '14:00', '16:00', 1, 'seed'),
  (57, 11, 2, 'Mass', 'Holy Mass: A Thanksgiving Celebration', NULL, '16:00', '16:45', 2, 'seed'),
  (58, 11, 2, 'Break', 'Break', NULL, '16:45', '17:00', 3, 'seed'),
  (59, 11, 3, 'Performance', 'Moodsetter', NULL, '17:00', '17:05', 4, 'seed'),
  (60, 11, 3, 'Program', 'Opening Remarks', NULL, '17:05', '17:15', 5, 'seed'),
  (61, 11, 3, 'Performance', 'Opening Performance', NULL, '17:15', '17:20', 6, 'seed'),
  (62, 11, 3, 'Performance', 'Opening Spectacle', NULL, '17:20', '17:25', 7, 'seed'),
  (63, 11, 3, 'Activity', 'Ice breaker', NULL, '17:25', '17:40', 8, 'seed'),
  (64, 11, 3, 'Awards', 'Awardees Pt. 1', NULL, '17:40', '17:55', 9, 'seed'),
  (65, 11, 3, 'Raffle', 'Raffle 1', NULL, '17:55', '18:00', 10, 'seed'),
  (66, 11, 3, 'Meal', 'Dinner', NULL, '18:00', '19:00', 11, 'seed'),
  (67, 11, 3, 'Performance', 'Performer 1', NULL, '18:30', '19:15', 12, 'seed'),
  (68, 11, 4, 'Raffle', 'Raffle 2', NULL, '19:15', '19:30', 13, 'seed'),
  (69, 11, 4, 'Awards', 'Awardees Pt. 2', NULL, '19:30', '19:45', 14, 'seed'),
  (70, 11, 4, 'Awards', 'Best Dressed', NULL, '19:45', '20:00', 15, 'seed'),
  (71, 11, 4, 'Program', 'Project Village', NULL, '20:00', '20:05', 16, 'seed'),
  (72, 11, 4, 'Awards', 'Silver Pioneers Award', NULL, '20:05', '20:20', 17, 'seed'),
  (73, 11, 4, 'Raffle', 'Raffle 3', NULL, '20:20', '20:30', 18, 'seed'),
  (74, 11, 5, 'Celebration', 'Summit toast', NULL, '20:30', '20:35', 19, 'seed'),
  (75, 11, 5, 'Performance', 'Summit lights', NULL, '20:35', '20:40', 20, 'seed'),
  (76, 11, 5, 'Performance', 'Headliner Performance', NULL, '20:40', '21:15', 21, 'seed'),
  (77, 11, 5, 'Video', 'SDE', NULL, '21:15', '21:20', 22, 'seed'),
  (78, 11, 6, 'Celebration', 'DJ Set and Socials', NULL, '21:20', '23:00', 23, 'seed');

INSERT INTO evt_images (id, file, title, place, credit, created_by) VALUES
  (1, 'fine-arts.webp', 'National Museum of Fine Arts', 'The old Legislative Building', 'PhiliptheNumber1, CC BY 4.0', 'seed'),
  (2, 'natural-history.webp', 'National Museum of Natural History', 'Agrifina Circle, Rizal Park', 'RoyKabanlit, CC BY-SA 4.0', 'seed'),
  (3, 'anthropology.webp', 'National Museum of Anthropology', 'Next door, on the same museum grounds', 'Ralff Nestor Nacor, CC BY-SA 4.0', 'seed'),
  (4, 'binondo.webp', 'Binondo', 'Manila’s Chinatown', 'Richmond Chi, CC BY-SA 4.0', 'seed'),
  (5, 'plaza-lorenzo-ruiz.webp', 'Plaza Lorenzo Ruiz', 'Binondo', 'patrickroque01, CC BY-SA 4.0', 'seed'),
  (6, NULL, 'Royu Electrical', 'Proudly owned by FELCO', NULL, 'seed'),
  (7, NULL, 'The Calumpit plant', 'Calumpit, Bulacan', NULL, 'seed'),
  (8, NULL, 'What Royu makes', 'From switches to switchgear', NULL, 'seed'),
  (9, NULL, 'FELCO at 25', 'Built by purpose, powered by progress', NULL, 'seed'),
  (10, NULL, 'Quality Solutions for Quality Living', 'What FELCO does', NULL, 'seed'),
  (11, NULL, 'FELCO in numbers', 'Bringing quality closer to you', NULL, 'seed'),
  (12, NULL, '25 years of brands', 'From one lighting brand to many', NULL, 'seed'),
  (13, NULL, 'Mission and Vision', 'What drives FELCO', NULL, 'seed'),
  (14, 'east-ocean-palace.webp', 'East Ocean Palace', 'Parañaque City', NULL, 'seed'),
  (15, 'naia.webp', 'NAIA Terminal 3', 'Ninoy Aquino International Airport, Pasay', 'Manila International Airport Authority, public domain', 'seed'),
  (16, 'people/aikel-de-guzman.webp', 'Aikel De Guzman', NULL, NULL, 'seed'),
  (17, 'people/crisselita-mismanos.webp', 'Crisselita Mismanos', NULL, NULL, 'seed'),
  (18, 'people/eva-dy.webp', 'Eva Dy', NULL, NULL, 'seed'),
  (19, 'people/faith-batalla.webp', 'Faith Batalla', NULL, NULL, 'seed'),
  (20, 'people/faith-gonzales.webp', 'Faith Gonzales', NULL, NULL, 'seed'),
  (21, 'people/jay-r-sombero.webp', 'Jay-R Sombero', NULL, NULL, 'seed'),
  (22, 'people/john-montalvan.webp', 'John Montalvan', NULL, NULL, 'seed'),
  (23, 'people/karen-yao.webp', 'Karen Yao', NULL, NULL, 'seed'),
  (24, 'people/lady-jill-sabado.webp', 'Lady Jill Sabado', NULL, NULL, 'seed'),
  (25, 'people/quennie-may-pastrana.webp', 'Quennie May Pastrana', NULL, NULL, 'seed'),
  (26, 'people/richmond-ronquillo.webp', 'Richmond Ronquillo', NULL, NULL, 'seed'),
  (27, 'people/shirley-de-jesus.webp', 'Shirley De Jesus', NULL, NULL, 'seed');

INSERT INTO evt_image_facts (id, image_id, fact, sort_order, created_by) VALUES
  (1, 1, 'It fills the former Legislative Building, completed in 1926, where the country’s lawmakers once met.', 1, 'seed'),
  (2, 1, 'Home to Juan Luna’s Spoliarium (1884), the largest painting in the Philippines; it won a gold medal at the Madrid Exposition that year.', 2, 'seed'),
  (3, 1, 'Works by Félix Resurrección Hidalgo and other Filipino masters hang in its galleries.', 3, 'seed'),
  (4, 1, 'Entrance is free.', 4, 'seed'),
  (5, 2, 'It fills the former Agriculture and Commerce Building (1940) and opened as a museum in 2018.', 1, 'seed'),
  (6, 2, 'At its heart stands the “Tree of Life”, a structure rising through the central atrium.', 2, 'seed'),
  (7, 2, 'Its galleries cover the country’s plants, animals and ecosystems, from mountains to the deep sea.', 3, 'seed'),
  (8, 2, 'It keeps the remains of Lolong, one of the largest saltwater crocodiles ever held in captivity.', 4, 'seed'),
  (9, 3, 'It fills the former Finance Building, the twin of the Natural History building across Agrifina Circle.', 1, 'seed'),
  (10, 3, 'It holds the treasures of the San Diego, a Spanish galleon that sank off Batangas in 1600.', 2, 'seed'),
  (11, 3, 'Here too is the Manunggul Jar, a burial jar nearly 3,000 years old and a National Cultural Treasure.', 3, 'seed'),
  (12, 4, 'Founded in 1594, Binondo is often called the oldest Chinatown in the world.', 1, 'seed'),
  (13, 4, 'Ongpin Street is the heart of its food scene: hopia, siopao, dumplings and more.', 2, 'seed'),
  (14, 5, 'It honours San Lorenzo Ruiz, born in Binondo, the first Filipino saint, canonised in 1987.', 1, 'seed'),
  (15, 5, 'It faces Binondo Church, the Minor Basilica of San Lorenzo Ruiz, first founded in 1596.', 2, 'seed'),
  (16, 5, 'The Binondo trip’s bus drops you here, at the doorstep of old Binondo.', 3, 'seed'),
  (17, 6, 'Royu Electrical is owned by Firefly Electric and Lighting Corporation.', 1, 'seed'),
  (18, 6, 'For over two decades it has served Filipino consumers with quality, affordable electrical products.', 2, 'seed'),
  (19, 6, 'It started with switches and outlets, and grew into a full range of electrical solutions.', 3, 'seed'),
  (20, 6, 'The electrical specialists: a one-stop shop for quality electrical needs.', 4, 'seed'),
  (21, 7, 'Royu’s products are made at its manufacturing plant in Calumpit.', 1, 'seed'),
  (22, 7, 'The plant runs on cutting-edge machinery imported from Europe.', 2, 'seed'),
  (23, 7, 'A team of licensed engineers makes sure every product meets high standards of quality, safety and durability.', 3, 'seed'),
  (24, 7, 'Industry-grade testing facilities are right on site.', 4, 'seed'),
  (25, 8, 'ROYU Wires and Devices arrived in 2002, and grew in 2013 with Royu’s own wires and communications cables, a favourite of professionals and homeowners.', 1, 'seed'),
  (26, 8, 'Panel boards, distribution panels, switchboards and switchgear followed.', 2, 'seed'),
  (27, 8, 'Circuit protection came in 2017, metallic tubes for conduits in 2021.', 3, 'seed'),
  (28, 8, 'In 2024 the ROYU Piping System added PVC pipes and fittings.', 4, 'seed'),
  (29, 9, 'FELCO started in Manila in 2001 with a simple goal: quality lighting and electrical products that every Filipino can get and afford.', 1, 'seed'),
  (30, 9, 'For 25 years, it has stood by its promise to deliver quality that Filipinos can rely on.', 2, 'seed'),
  (31, 9, 'More than longevity, the milestone reflects the trust of its customers, partners and communities.', 3, 'seed'),
  (32, 9, 'Its journey has been guided by integrity, dedication and values that endure, carried through every brand it serves.', 4, 'seed'),
  (33, 9, 'The silver milestone isn’t an ending, but a launchpad for what comes next.', 5, 'seed'),
  (34, 10, 'Light bulbs, electrical devices, accessories, door hardware, hand tools and power tools: FELCO builds confidence in every one.', 1, 'seed'),
  (35, 10, 'Dependable lighting, electrical and power solutions for Filipino homes, businesses and communities.', 2, 'seed'),
  (36, 10, 'From everyday essentials to engineered systems, made to stand the test of time.', 3, 'seed'),
  (37, 11, '25 years of experience, since 2001.', 1, 'seed'),
  (38, 11, '13,000+ stores served directly, and a presence in 1,000+ modern retail stores.', 2, 'seed'),
  (39, 11, '2,000+ professional partner accounts.', 3, 'seed'),
  (40, 11, '17 distribution hubs and branches in key cities across the archipelago, for fast, reliable access nationwide.', 4, 'seed'),
  (41, 12, '2001: Firefly Lighting. 2002: ROYU Wires and Devices.', 1, 'seed'),
  (42, 12, '2011: Firefly LED sets a new standard for efficient lighting.', 2, 'seed'),
  (43, 12, '2016: ECOLum, FELCO’s value brand, and CHINT for demanding environments.', 3, 'seed'),
  (44, 12, '2018: Dulux Paints, FELCO’s first step beyond electrical and lighting.', 4, 'seed'),
  (45, 12, '2020: Firefly Yellow Shield and Firefly Home. 2021: Firefly Smart Solutions.', 5, 'seed'),
  (46, 12, '2023: HERKS locksets and door hardware. 2024: ROYU Piping System, ABB and DCK Power Tools.', 6, 'seed'),
  (47, 12, '2026: XPERT sanitary fixtures and fittings.', 7, 'seed'),
  (48, 13, 'Mission: elevating everyday experiences with accessible quality products and solutions that every Filipino deserves.', 1, 'seed'),
  (49, 13, 'Vision: to be the partner of choice for lighting and power solutions in the Philippines.', 2, 'seed'),
  (50, 15, 'NAIA is the main international gateway to the Philippines, serving Metro Manila.', 1, 'seed'),
  (51, 15, 'It is named after Senator Benigno “Ninoy” Aquino Jr., who was assassinated at the airport in 1983; it took his name in 1987.', 2, 'seed'),
  (52, 15, 'It has four terminals; Terminal 3, pictured, opened in 2008.', 3, 'seed'),
  (53, 15, 'Airlines are split across the terminals, so check which one yours uses before you fly.', 4, 'seed');

INSERT INTO evt_image_links (id, image_id, entity_type, entity_id, sort_order, created_by) VALUES
  (1, 1, 'activity', 3, 1, 'seed'),
  (2, 2, 'activity', 3, 2, 'seed'),
  (3, 3, 'activity', 3, 3, 'seed'),
  (4, 4, 'activity', 4, 1, 'seed'),
  (5, 5, 'activity', 4, 2, 'seed'),
  (6, 6, 'activity', 2, 1, 'seed'),
  (7, 7, 'activity', 2, 2, 'seed'),
  (8, 8, 'activity', 2, 3, 'seed'),
  (9, 9, 'activity', 5, 1, 'seed'),
  (10, 10, 'activity', 5, 2, 'seed'),
  (11, 11, 'activity', 5, 3, 'seed'),
  (12, 12, 'activity', 5, 4, 'seed'),
  (13, 13, 'activity', 5, 5, 'seed'),
  (14, 14, 'activity', 6, 1, 'seed'),
  (15, 15, 'activity', 1, 1, 'seed'),
  (16, 14, 'event', 1, 1, 'seed'),
  (17, 16, 'person', 4, 1, 'seed'),
  (18, 17, 'person', 5, 1, 'seed'),
  (19, 18, 'person', 6, 1, 'seed'),
  (20, 19, 'person', 7, 1, 'seed'),
  (21, 20, 'person', 8, 1, 'seed'),
  (22, 21, 'person', 9, 1, 'seed'),
  (23, 22, 'person', 10, 1, 'seed'),
  (24, 23, 'person', 11, 1, 'seed'),
  (25, 24, 'person', 12, 1, 'seed'),
  (26, 25, 'person', 13, 1, 'seed'),
  (27, 26, 'person', 14, 1, 'seed'),
  (28, 27, 'person', 15, 1, 'seed');

INSERT INTO evt_people (id, event_id, activity_id, category, group_name, role, name, employee_id, note, is_secret, is_featured, reveal_at, sort_order, created_by) VALUES
  (1, 1, 6, 'performers', 'Headliner', 'Headliner', 'To be revealed', NULL, 'Part 3: Beyond the Summit · 8:40 PM', 1, 1, NULL, 1, 'seed'),
  (2, 1, 6, 'performers', 'Line-up', 'Opening performance', 'To be revealed', NULL, 'Part 1: Ascent · 5:15 PM', 1, 0, NULL, 2, 'seed'),
  (3, 1, 6, 'performers', 'Line-up', 'Performer 1', 'To be revealed', NULL, 'During dinner · 6:30 PM', 1, 0, NULL, 3, 'seed'),
  (4, 1, NULL, 'committee', NULL, 'Organizer', 'Aikel De Guzman', NULL, NULL, 0, 0, NULL, 1, 'seed'),
  (5, 1, NULL, 'committee', NULL, 'Organizer', 'Crisselita Mismanos', NULL, NULL, 0, 0, NULL, 2, 'seed'),
  (6, 1, NULL, 'committee', NULL, 'Organizer', 'Eva Dy', NULL, NULL, 0, 0, NULL, 3, 'seed'),
  (7, 1, NULL, 'committee', NULL, 'Organizer', 'Faith Batalla', NULL, NULL, 0, 0, NULL, 4, 'seed'),
  (8, 1, NULL, 'committee', NULL, 'Organizer', 'Faith Gonzales', NULL, NULL, 0, 0, NULL, 5, 'seed'),
  (9, 1, NULL, 'committee', NULL, 'Organizer', 'Jay-R Sombero', NULL, NULL, 0, 0, NULL, 6, 'seed'),
  (10, 1, NULL, 'committee', NULL, 'Organizer', 'John Montalvan', NULL, NULL, 0, 0, NULL, 7, 'seed'),
  (11, 1, NULL, 'committee', NULL, 'Organizer', 'Karen Yao', NULL, NULL, 0, 0, NULL, 8, 'seed'),
  (12, 1, NULL, 'committee', NULL, 'Organizer', 'Lady Jill Sabado', NULL, NULL, 0, 0, NULL, 9, 'seed'),
  (13, 1, NULL, 'committee', NULL, 'Organizer', 'Quennie May Pastrana', NULL, NULL, 0, 0, NULL, 10, 'seed'),
  (14, 1, NULL, 'committee', NULL, 'Organizer', 'Richmond Ronquillo', NULL, NULL, 0, 0, NULL, 11, 'seed'),
  (15, 1, NULL, 'committee', NULL, 'Organizer', 'Shirley De Jesus', NULL, NULL, 0, 0, NULL, 12, 'seed');

COMMIT;
```

## Part 3: guest list and assignments (example, commented out)

Employee IDs come from `vw_felco_employees.employee_id`. Session IDs: 2–5 ROYU Tour (Thu AM, Thu PM, Fri AM, Fri PM),
6–7 National Museum (Thu AM, Fri PM), 8–9 Binondo (Thu PM, Fri AM). Activities open to all (Arrival, Zen Office
Tour, the Night) need no assignment: every guest sees them.

```sql
-- INSERT INTO evt_guests (event_id, employee_id, status, created_by) VALUES
--   (1, '10234', 'invited', 'admin@fireflyelectric.com');
-- INSERT INTO evt_assignments (session_id, employee_id, group_code, created_by) VALUES
--   (3, '10234', 'Bus B', 'admin@fireflyelectric.com'),   -- ROYU Tour, Thursday afternoon
--   (7, '10234', NULL,    'admin@fireflyelectric.com');   -- National Museum, Friday afternoon
```

## Upgrade: if you ran the first version of this file

The first version had no `is_featured` / `reveal_at`, attached the committee to the Night and used a Manila Bay photo for Arrival. Run this once:

```sql
ALTER TABLE evt_people
  MODIFY COLUMN is_secret TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'shown as To be revealed (no name or photo) until reveal_at',
  ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = the big spotlight card' AFTER is_secret,
  ADD COLUMN reveal_at DATETIME NULL COMMENT 'Manila time; NULL = secret until is_secret is cleared' AFTER is_featured;

UPDATE evt_people SET is_featured = 1, updated_by = 'admin' WHERE id = 1;                      -- the headliner
UPDATE evt_people SET activity_id = NULL, updated_by = 'admin' WHERE category = 'committee';  -- the whole event

-- the Arrival slide: NAIA instead of Manila Bay
UPDATE evt_images
   SET file = 'naia.webp', title = 'NAIA Terminal 3', place = 'Ninoy Aquino International Airport, Pasay',
       credit = 'Manila International Airport Authority, public domain', updated_by = 'admin'
 WHERE file = 'welcome.webp';

-- its facts
INSERT INTO evt_image_facts (image_id, fact, sort_order, created_by)
SELECT i.id, f.fact, f.sort_order, 'admin' FROM evt_images i JOIN (
  SELECT 1 AS sort_order, 'NAIA is the main international gateway to the Philippines, serving Metro Manila.' AS fact
  UNION ALL   SELECT 2 AS sort_order, 'It is named after Senator Benigno “Ninoy” Aquino Jr., who was assassinated at the airport in 1983; it took his name in 1987.' AS fact
  UNION ALL   SELECT 3 AS sort_order, 'It has four terminals; Terminal 3, pictured, opened in 2008.' AS fact
  UNION ALL   SELECT 4 AS sort_order, 'Airlines are split across the terminals, so check which one yours uses before you fly.' AS fact
) f ON 1 = 1 WHERE i.file = 'naia.webp';
```

To reveal an act at a set time, put its real name (and photo link) in now and set e.g.
`reveal_at = '2026-12-05 20:40:00'` (Manila time): until then the site only ever receives "To be revealed".

## Undo (only if you need to start over)

```sql
-- DROP TABLE evt_assignments, evt_guests, evt_people, evt_image_links, evt_image_facts, evt_images,
--            evt_items, evt_sections, evt_sessions, evt_activities, evt_events;
```
