// Itinerary. Dec 5 is the official programme; Dec 3–4 is known only in outline (which activity on which day,
// and times, to follow). Photos are placeholders from Wikimedia Commons; `credits` are shown in the site footer
// (CC BY / BY-SA require it).
import welcomePhoto from '../assets/photos/welcome.webp'
import museumPhoto from '../assets/photos/museum.webp'
import binondoPhoto from '../assets/photos/binondo.webp'
import nightPhoto from '../assets/photos/night.webp'

export const credits = [
  'Manila Bay sunset — Vyacheslav Argenberg, CC BY 4.0',
  'National Museum of the Philippines — Judgefloro, CC0',
  'Chinatown Arch, Manila — Richmond Chi, CC BY-SA 4.0',
  'Manila Bay at night — Ralff Nestor Nacor, CC BY-SA 4.0',
]

// Day: date (+ endDate for a span), title, area, pills, then either `stops` or `parts`.
// Part: title, range, optional tag (who it's for), note, options (assigned per person: { title, place, image }),
// stops (its programme; empty = "Programme to follow").
// Stop: time "HH:MM" Manila time (omit = TBA), type (see lib/kinds.js), title, optional place, note, image, mapUrl.
// ponytail: tags and options are the public view; once sign-in is live each person gets only their own parts.
// FELCO Explores Manila (official): one trip per person, in one slot.
//   Dec 3: Museum Trip in the morning, Binondo Trip in the afternoon
//   Dec 4: Binondo Trip in the morning, Museum Trip in the afternoon
// Every slot's programme; the preview below shows all four, sign-in will show each person their own.
const zen = 'ZEN'
export const exploreManila = {
  museumThu: { date: '2026-12-03', slot: 'Thursday morning', range: '8:00 AM – 12:45 PM', stops: [
    { time: '08:00', type: 'gather', title: 'Assembly at ZEN', place: zen },
    { time: '08:15', type: 'bus', title: 'Travel to the National Museum' },
    { time: '08:30', type: 'hotel', title: 'Check-in at the venue', place: 'National Museum' },
    { time: '09:00', type: 'tour', title: 'Exploring the National Museum of Fine Arts', place: 'National Museum of Fine Arts' },
    { time: '10:30', type: 'hotel', title: 'Museum transfer and check-in', place: 'National Museum of Natural History' },
    { time: '11:00', type: 'tour', title: 'Exploring the National Museum of Natural History', place: 'National Museum of Natural History' },
    { time: '12:30', type: 'bus', title: 'Travel back to ZEN' },
  ] },
  museumFri: { date: '2026-12-04', slot: 'Friday afternoon', range: '12:00 – 4:45 PM', stops: [
    { time: '12:00', type: 'gather', title: 'Assembly at ZEN', place: zen },
    { time: '12:15', type: 'bus', title: 'Travel to the National Museum' },
    { time: '12:30', type: 'hotel', title: 'Check-in at the venue', place: 'National Museum' },
    { time: '13:00', type: 'tour', title: 'Exploring the National Museum of Natural History', place: 'National Museum of Natural History' },
    { time: '14:30', type: 'hotel', title: 'Museum transfer and check-in', place: 'National Museum of Fine Arts' },
    { time: '15:00', type: 'tour', title: 'Exploring the National Museum of Fine Arts', place: 'National Museum of Fine Arts' },
    { time: '16:30', type: 'bus', title: 'Travel back to ZEN' },
  ] },
  binondoThu: { date: '2026-12-03', slot: 'Thursday afternoon', range: '12:45 – 5:00 PM', stops: [
    { time: '12:45', type: 'gather', title: 'Assembly at ZEN', place: zen },
    { time: '13:00', type: 'bus', title: 'Travel to Plaza Lorenzo Ruiz' },
    { time: '13:15', type: 'tour', title: 'Exploring Binondo', place: 'Binondo, Manila' },
    { time: '16:45', type: 'bus', title: 'Travel back to ZEN' },
  ] },
  binondoFri: { date: '2026-12-04', slot: 'Friday morning', range: '7:45 AM – 12:00 PM', stops: [
    { time: '07:45', type: 'gather', title: 'Assembly at ZEN', place: zen },
    { time: '08:00', type: 'bus', title: 'Travel to Plaza Lorenzo Ruiz' },
    { time: '08:15', type: 'tour', title: 'Exploring Binondo', place: 'Binondo, Manila' },
    { time: '11:45', type: 'bus', title: 'Travel back to ZEN' },
  ] },
}

// Royu Tour (official): Dec 3 and 4, two runs a day (150 people each). In the plant tour each team rotates
// through the three stations (Wires, Fab, Plastics). runs: every run, for when each person sees their own.
const plant = 'Each team rotates through Wires, Fab and Plastics.'
const royuStops = (t) => [
  { time: t[0], type: 'flight', title: 'Arrival at Royu', place: 'Royu' },
  { time: t[1], type: 'gather', title: 'Registration', place: 'Royu' },
  { time: t[2], type: 'mic', title: 'Orientation', place: 'Royu', note: 'History, house rules, and drafting into teams.' },
  { time: t[3], type: 'tour', title: 'Plant tour: first station', place: 'Royu', note: plant },
  { time: t[4], type: 'tour', title: 'Plant tour: second station', place: 'Royu' },
  { time: t[5], type: 'tour', title: 'Plant tour: third station', place: 'Royu' },
  { time: t[6], type: 'meal', title: 'Back to the assembly area; lunch distribution', place: 'Royu' },
  { time: t[7], type: 'bus', title: 'Departure' },
]
const royuAM = royuStops(['08:00', '08:30', '08:45', '09:00', '09:45', '10:15', '11:00', '11:45'])
const royuPM = royuStops(['12:30', '13:00', '13:15', '13:45', '14:30', '15:15', '15:45', '16:30'])
export const royuTour = {
  thuAM: { date: '2026-12-03', slot: 'Thursday morning', range: '8:00 AM – 12:00 PM', stops: royuAM },
  thuPM: { date: '2026-12-03', slot: 'Thursday afternoon', range: '12:30 – 5:00 PM', stops: royuPM },
  friAM: { date: '2026-12-04', slot: 'Friday morning', range: '8:00 AM – 12:00 PM', stops: royuAM },
  friPM: { date: '2026-12-04', slot: 'Friday afternoon', range: '12:30 – 5:00 PM', stops: royuPM },
}

// a trip as a part of its day: its photo, slot and official programme
const trip = (key, title, photo, place, first) => ({
  title: `FELCO Explores Manila: ${title}`,
  tag: exploreManila[key].slot.replace(/^\w+ (\w)/, (_, c) => c.toUpperCase()) + ' slot', // 'Thursday morning' → 'Morning slot'
  range: exploreManila[key].range,
  note: first ? 'One trip per person, in one slot. Once you sign in, you’ll see only yours.' : undefined,
  options: [{ title, place, image: photo }],
  stops: exploreManila[key].stops,
})

export const itinerary = [
  // Preview: both FELCO Explores Manila trips show on each day, in their slots; once sign-in is live each
  // person sees only their own trip and Royu run. Royu is shown as the Thursday afternoon run (registered).
  // The Zen Office Tour is still SAMPLE (made up) until the organisers confirm.
  {
    date: '2026-12-03',
    title: 'Welcome to Manila',
    area: 'Explores Manila · Royu Tour',
    pills: ['Museum trip AM · Binondo trip PM', 'Royu Tour · 12:30 – 5:00 PM'],
    parts: [
      { title: 'Arrival in Manila', range: 'December 3', note: 'All employees in Manila by December 3.', stops: [{ type: 'flight', title: 'Travel details to follow' }] },
      trip('museumThu', 'National Museum', museumPhoto, 'Fine Arts & Natural History', true),
      trip('binondoThu', 'Binondo', binondoPhoto, 'Plaza Lorenzo Ruiz and Binondo'),
      {
        title: 'Royu Tour', tag: 'You’re registered · Thursday afternoon run', range: royuTour.thuPM.range,
        note: 'Two runs a day on December 3 and 4, 150 people each.',
        stops: royuTour.thuPM.stops,
      },
    ],
  },
  {
    date: '2026-12-04',
    title: 'FELCO Explores Manila',
    area: 'Explores Manila · Zen Office',
    pills: ['Binondo trip AM · Museum trip PM', 'Zen Office Tour: sample programme'],
    parts: [
      trip('binondoFri', 'Binondo', binondoPhoto, 'Plaza Lorenzo Ruiz and Binondo', true),
      trip('museumFri', 'National Museum', museumPhoto, 'Fine Arts & Natural History'),
      {
        title: 'Zen Office Tour', tag: 'Open to all', range: 'Sample · 5:00 – 6:30 PM · 11th floor',
        stops: [
          { time: '17:00', type: 'gather', title: 'Welcome on the 11th floor', place: 'Zen Office, 11th floor' },
          { time: '17:15', type: 'tour', title: 'Office walkthrough', place: 'Zen Office, 11th floor' },
          { time: '17:45', type: 'mic', title: 'Meet the teams', place: 'Zen Office, 11th floor' },
          { time: '18:15', type: 'party', title: 'Merienda and photos', place: 'Zen Office, 11th floor' },
        ],
      },
    ],
  },
  {
    date: '2026-12-05',
    title: 'Silver Horizons Night',
    area: 'East Ocean Palace, Parañaque City',
    pills: ['2:00 – 11:00 PM', 'East Ocean Palace'],
    parts: [
      {
        title: 'Registration & Pre-event', range: '2:00 – 4:00 PM',
        stops: [
          // one 2-hour block in the organisers' schedule: no separate times for the two
          { time: '14:00', type: 'gather', title: 'Registration and pre-event activities' },
        ],
      },
      {
        title: 'Holy Mass', range: '4:00 – 5:00 PM',
        stops: [
          { time: '16:00', type: 'mass', title: 'Holy Mass: A Thanksgiving Celebration' },
          { time: '16:45', type: 'break', title: 'Break' },
        ],
      },
      {
        title: 'Part 1: Ascent', range: '5:00 – 7:00 PM',
        stops: [
          { time: '17:00', type: 'perf', title: 'Moodsetter' },
          { time: '17:05', type: 'mic', title: 'Opening remarks' },
          { time: '17:15', type: 'perf', title: 'Opening performance' },
          { time: '17:20', type: 'perf', title: 'Opening spectacle' },
          { time: '17:25', type: 'party', title: 'Ice breaker' },
          { time: '17:40', type: 'award', title: 'Awardees, part 1' },
          { time: '17:55', type: 'raffle', title: 'Raffle 1' },
          { time: '18:00', type: 'meal', title: 'Dinner' },
          { time: '18:30', type: 'perf', title: 'Performer 1' },
        ],
      },
      {
        title: 'Part 2: Summit', range: '7:00 – 8:30 PM',
        stops: [
          { time: '19:15', type: 'raffle', title: 'Raffle 2' },
          { time: '19:30', type: 'award', title: 'Awardees, part 2' },
          { time: '19:45', type: 'award', title: 'Best Dressed' },
          { time: '20:00', type: 'mic', title: 'Project Village' },
          { time: '20:05', type: 'award', title: 'Silver Pioneers Award' },
          { time: '20:20', type: 'raffle', title: 'Raffle 3' },
        ],
      },
      {
        title: 'Part 3: Beyond the Summit', range: '8:30 – 9:20 PM',
        stops: [
          { time: '20:30', type: 'party', title: 'Summit toast' },
          { time: '20:35', type: 'perf', title: 'Summit lights' },
          { time: '20:40', type: 'perf', title: 'Headliner performance' },
          { time: '21:15', type: 'video', title: 'Same-day edit' },
        ],
      },
      {
        title: 'After Party', range: '9:20 – 11:00 PM',
        stops: [{ time: '21:20', type: 'party', title: 'DJ set and socials' }],
      },
    ],
  },
]

// Home's film strip: the trip in five frames. No image = a designed night frame; two images = a split frame.
export const journey = [
  { when: 'Dec 3', title: 'Arrival', area: 'Manila', blurb: 'Everyone in Manila by December 3, from every branch.', images: [welcomePhoto] },
  { when: 'Dec 3–4', title: 'Royu Tour', area: 'Registered participants', blurb: 'A plant tour for those who registered: two runs a day, December 3 and 4.' },
  { when: 'Dec 3–4', title: 'FELCO Explores Manila', area: 'Museum or Binondo', blurb: 'The National Museum or Binondo, morning or afternoon: one trip per person.', images: [museumPhoto, binondoPhoto] },
  { when: 'Dec 4', title: 'Zen Office Tour', area: '11th floor', blurb: 'Open to all. Details to follow.' },
  { when: 'Dec 5', title: 'Silver Horizons Night', area: 'East Ocean Palace', blurb: 'The 25th anniversary celebration, 2:00 to 11:00 PM.', images: [nightPhoto] },
]
