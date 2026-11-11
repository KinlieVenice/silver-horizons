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
export const itinerary = [
  // SAMPLE (made up): which tour on which day, and every tour programme, until the organisers confirm.
  // Seen as one employee: registered for Royu, assigned the National Museum.
  {
    date: '2026-12-03',
    title: 'Welcome to Manila',
    area: 'Arrival · Royu Tour',
    pills: ['Sample programme', 'Royu Tour 1:00 – 5:30 PM'],
    parts: [
      { title: 'Arrival in Manila', range: 'Morning', note: 'All employees in Manila by December 3.', stops: [{ type: 'flight', title: 'Travel details to follow' }] },
      {
        title: 'Royu Tour', tag: 'You’re registered', range: '1:00 – 5:30 PM',
        stops: [
          { time: '13:00', type: 'bus', title: 'Assembly at the hotel lobby', place: 'Hotel lobby' },
          { time: '14:00', type: 'gather', title: 'Welcome and safety briefing', place: 'Royu' },
          { time: '14:30', type: 'tour', title: 'Plant tour: the production lines', place: 'Royu' },
          { time: '16:00', type: 'tour', title: 'Product showroom', place: 'Royu' },
          { time: '16:45', type: 'meal', title: 'Merienda with the Royu team', place: 'Royu' },
          { time: '17:30', type: 'bus', title: 'Bus back to the hotel' },
        ],
      },
    ],
  },
  {
    date: '2026-12-04',
    title: 'The Manila Experience',
    area: 'Manila Tour · Zen Office',
    pills: ['Sample programme', '8:30 AM – 5:30 PM'],
    parts: [
      {
        title: 'Manila Tour', tag: 'Your assigned tour', range: '8:30 AM – 3:00 PM',
        options: [{ title: 'National Museum', place: 'Ermita, Manila', image: museumPhoto }],
        stops: [
          { time: '08:30', type: 'bus', title: 'Assembly at the hotel lobby', place: 'Hotel lobby' },
          { time: '09:30', type: 'tour', title: 'Fine Arts: Luna’s Spoliarium', place: 'National Museum of Fine Arts' },
          { time: '11:00', type: 'tour', title: 'Anthropology: the Philippines before Spain', place: 'National Museum of Anthropology' },
          { time: '12:30', type: 'meal', title: 'Lunch', place: 'Ermita' },
          { time: '13:30', type: 'tour', title: 'Natural History: the Tree of Life atrium', place: 'National Museum of Natural History' },
          { time: '15:00', type: 'bus', title: 'Bus back to the hotel' },
        ],
      },
      {
        title: 'Zen Office Tour', tag: 'Open to all', range: '4:00 – 5:30 PM · 11th floor',
        stops: [
          { time: '16:00', type: 'gather', title: 'Welcome on the 11th floor', place: 'Zen Office, 11th floor' },
          { time: '16:15', type: 'tour', title: 'Office walkthrough', place: 'Zen Office, 11th floor' },
          { time: '16:45', type: 'mic', title: 'Meet the teams', place: 'Zen Office, 11th floor' },
          { time: '17:15', type: 'party', title: 'Merienda and photos', place: 'Zen Office, 11th floor' },
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
          { time: '14:00', type: 'gather', title: 'Registration' },
          { time: '14:00', type: 'gather', title: 'Pre-event activities' },
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
    closing: 'Heading home: details to follow.',
  },
]

// Home's film strip: the trip in five frames. No image = a designed night frame; two images = a split frame.
export const journey = [
  { when: 'Dec 3', title: 'Arrival', area: 'Manila', blurb: 'Everyone in Manila by December 3, from every branch.', images: [welcomePhoto] },
  { when: 'Dec 3', title: 'Royu Tour', area: 'Registered participants', blurb: 'For those who registered. Details to follow.' },
  { when: 'Dec 4', title: 'Manila Tour', area: 'Museum or Binondo', blurb: 'The National Museum or Binondo, Manila’s Chinatown: one per person, assigned.', images: [museumPhoto, binondoPhoto] },
  { when: 'Dec 4', title: 'Zen Office Tour', area: '11th floor', blurb: 'Open to all. Details to follow.' },
  { when: 'Dec 5', title: 'Silver Horizons Night', area: 'East Ocean Palace', blurb: 'The 25th anniversary celebration, 2:00 to 11:00 PM.', images: [nightPhoto] },
]
