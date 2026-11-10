# Silver Horizons Microsite — Design Spec

Date: 2026-11-10
Status: Approved (design phase)

## Purpose

Event microsite for FELCO's 25th anniversary, "Silver Horizons — Celebrating the Journey, Embracing the Future". Employees from branches across the Philippines travel to Manila. Manila team runs a multi-day itinerary ending in the main anniversary + Christmas party on **December 5, 2026, East Ocean Palace, Parañaque City**.

Site must match the elegance of the creatives team's graphics (Look Book cover, "This is Our Silver Moment", invite email, SILVER HORIZONS logo), be easy to navigate, and be mobile-first (attendees use it on phones during the trip).

## Scope of this phase

In:
- Frontend design and build with placeholder content
- 4 routes, responsive, dark theme

Out (later phases):
- Google login
- FastAPI backend / content API
- RSVP, add-to-calendar, announcements, 25-year milestone timeline, photo gallery

## Stack

- Frontend: Vite + Vue 3 + Vue Router + Tailwind CSS, in `frontend/`
- Backend: FastAPI, in `backend/` (not built this phase)
- `garden-skills/` is a reference skill clone only; to be gitignored

## Visual language

### Color

| Token | Value | Use |
|---|---|---|
| `navy-950` | `#040B24` | page background base |
| `navy-900` | `#0A1A45` | gradient top / surfaces |
| `glow` | `#3D6BC4` → white core | horizon light band at section bottoms |
| `silver` gradient | `#F4F6FA → #B8C2D3 → #7D889C` | headings, lines, icons, active states |
| `text` | `#E6EBF5` | body text |
| `muted` | `#9AA8C4` | secondary text |
| `felco-orange` | `#F5A623` | logos only, never a UI accent |

Backgrounds are always vertical navy gradients, never flat black.

### Type

- Display: **Bodoni Moda** (Google Fonts), silver gradient text fill (`background-clip: text`), for section titles and statements
- Body and labels: **Jost** (Google Fonts) light/regular; labels in uppercase with wide letter-spacing
- Hero uses the real `SILVER.png` logo image, not a CSS recreation

### Motifs

- Silver ribbon curve (inline SVG, silver gradient stroke): hero swoosh, Home statement section, and the spine of the itinerary timeline
- Horizontal scan-line stripes beneath horizon glows
- 4-point sparkle stars with subtle twinkle

### Heritage layer (Itinerary page)

Each day is one destination (e.g. National Museum, Binondo), styled as a travel-journal page. Same navy/silver as every page — Filipino feel comes only from motifs drawn in brand silver/blue:

- Rejected: warm cream/terracotta/gold section and purple dusk gradient (didn't belong with the brand)
- Day intro: outlined numeral, destination title, blurb, silver postage-stamp photo frame (placeholder until photos arrive) with area caption
- Capiz-window lattice (silver mullions) faintly behind the intro
- Banig weave strip (white / horizon blue / silver) as divider
- Baybayin "Maynila" watermark (Noto Sans Tagalog), tablet and up

Small text (times, stop titles, notes, tabs) uses Jost regular/medium; Bodoni only at ≥ 30px.

### Motion

Slow and restrained: fade/rise on scroll into view, ribbon stroke draws on hero load, sparkle twinkle. All disabled under `prefers-reduced-motion: reduce`.

### Theme

Dark only. No light mode.

## Routes

### `/` Home (story scroll)

1. **Hero**: FELCO logo + 25-years badge, `SILVER.png`, tagline, ribbon draws in, horizon glow. Countdown to 2026-12-05 (days / hours / minutes), silver numerals. After the date passes, countdown is replaced by "Thank you for celebrating with us".
2. **Welcome**: invite copy — "A journey worth celebrating. A horizon worth looking toward." plus the body paragraphs from the invite email.
3. **Statement**: "This is Our Silver Moment" in large display serif with ribbon swoosh; "25 years behind us. New horizons ahead."
4. **Teaser cards**: three cards linking to Itinerary, Gala, Info.

### `/itinerary` Manila Experience

- Sticky day tabs (Day 1 … Day N, with date).
- Each day: vertical timeline, silver ribbon as spine; stop cards show time, title, place, short note, optional map link.
- During the trip, the current date's tab is auto-selected; otherwise Day 1.
- The next upcoming stop (by device local time, on the current day) gets an "Up next" badge.

### `/gala` Main Event

- Date / venue block: December 5, 2026, East Ocean Palace, Parañaque City.
- Program flow as a timeline (same `TimelineStop` component).
- Look Book: removed for now; revisit when creatives supply images.

### `/info` Info

- Venue with map embed (Google Maps iframe) and address.
- Travel tips: what to bring, weather, transport.
- FAQ accordion using native `<details>/<summary>`.
- Contact: Corporate Communications Group.

## Navigation

- Mobile (< 768px): fixed bottom bar, 4 items (icon + label): Home, Itinerary, Gala, Info. Frosted navy background, silver active state. Page content gets bottom padding so nothing hides behind it; respects `env(safe-area-inset-bottom)`.
- Desktop (≥ 768px): slim top bar, small logo left, same 4 links right.

## Content / data

All content lives in `frontend/src/content/`:

- `itinerary.js`: `[{ date, title, stops: [{ time, title, place, note, mapUrl? }] }]`
- `program.js`: `{ date, stops }` gala program (same stop shape)
- `info.js`: `tips`, `faq` (`[{ q, a }]`), `contact`
- `event.js`: event name, tagline, start (ISO with +08:00), venue

Placeholder data now. Components only read these modules, so the later FastAPI content API can return the same JSON shapes without component changes.

## Components

Each has one job:

- `.silver-text` CSS utility — silver gradient fill for display headings
- `HorizonGlow` — glow band + scan-line stripes, positioned at a section bottom
- `Ribbon` — silver SVG curve, optional draw-in (clip-path wipe)
- `Sparkle` — 4-point star, optional twinkle
- `Countdown` — time remaining to event date
- `PageHeader` — shared inner-page header (eyebrow, title, ribbon, glow)
- `TimelineStop` — one stop card on the timeline spine
- `AppNav` — top bar (desktop) + bottom tab bar (mobile)
- Day tabs and FAQ (`<details>`) are inline in their views
- Time logic in `src/lib/schedule.js`, tested by `npm test` (node:test)

## Assets

- Have: `SILVER.png` (logo with FELCO + badge baked in; needs a clean transparent version without the grey drop-shadow box)
- Need from creatives: FELCO logo and 25-years badge as separate transparent PNG/SVG; Look Book images
- Missing assets use tasteful placeholders (navy panel with silver frame and label)

## Accessibility

- Text contrast ≥ 4.5:1 against navy (silver gradient headings checked at their darkest stop)
- All nav items are real links with visible focus rings
- Logo images have alt text; decorative SVGs are `aria-hidden`
- Reduced-motion respected

## Verification

- `npm run build` passes
- Visual check in browser at 375px and 1440px widths on all 4 routes
- Quick Lighthouse pass for accessibility and performance
- No unit test suite this phase (static placeholder UI); `Countdown` and "Up next" logic get one small test each since they branch on time
