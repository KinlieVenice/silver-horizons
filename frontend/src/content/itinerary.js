// PLACEHOLDER itinerary — replace with Manila team's final schedule. [brackets] = details to confirm.
// Placeholder photos from Wikimedia Commons; `credit` is shown in the site footer (CC BY / BY-SA require it).
import welcomePhoto from '../assets/photos/welcome.webp'
import museumPhoto from '../assets/photos/museum.webp'
import binondoPhoto from '../assets/photos/binondo.webp'
import nightPhoto from '../assets/photos/night.webp'

// Day: date, optional theme title, area, blurb, image + credit (Home film strip). A day can visit many places:
// each stop has its own place and optional image (shown beside the stop in the Itinerary).
// Stop times are Manila time, 24h "HH:MM". mapUrl optional.
// Stop type → icon: flight hotel meal tour bus gather free award mic; anything else (e.g. party) → sparkle.
export const itinerary = [
  {
    date: '2026-12-02',
    title: 'Welcome to Manila',
    area: 'Manila',
    blurb: 'Arrive, settle in, and meet colleagues from every branch.',
    image: welcomePhoto,
    credit: 'Manila Bay sunset — Vyacheslav Argenberg, CC BY 4.0',
    stops: [
      { time: '09:00', type: 'flight', title: 'Airport pick-up', place: 'NAIA Terminal [TBC]', note: 'Look for the Silver Horizons welcome team at arrivals.' },
      { time: '13:00', type: 'hotel', title: 'Hotel check-in', place: '[Hotel name]', note: 'Room assignments to follow.' },
      { time: '18:30', type: 'meal', title: 'Welcome dinner', place: '[Venue]', note: 'Meet colleagues from every branch.', image: welcomePhoto },
    ],
  },
  {
    date: '2026-12-03',
    title: 'National Museum of the Philippines',
    area: 'Ermita, Manila',
    blurb: 'A day among the nation’s art, history and natural heritage.',
    image: museumPhoto,
    credit: 'National Museum of the Philippines — Judgefloro, CC0',
    stops: [
      { time: '08:00', type: 'bus', title: 'Assembly at hotel lobby', place: '[Hotel name]', note: 'Buses depart 8:15 sharp.' },
      { time: '09:00', type: 'tour', title: '[Museum tour, first gallery]', place: 'National Museum, Manila', note: '[Tour details to follow.]', image: museumPhoto },
      { time: '12:30', type: 'meal', title: 'Lunch', place: '[Restaurant]', note: '[Details to follow.]' },
      { time: '14:00', type: 'tour', title: '[Museum tour, second gallery]', place: 'National Museum, Manila', note: '[Tour details to follow.]' },
      { time: '18:00', type: 'free', title: 'Free evening', place: 'Your choice', note: 'Rest or explore on your own.' },
    ],
  },
  {
    date: '2026-12-04',
    title: 'Binondo',
    area: 'Binondo, Manila',
    blurb: 'Manila’s historic Chinatown: old streets, temples, and a food crawl to remember.',
    image: binondoPhoto,
    credit: 'Chinatown Arch, Manila — Richmond Chi, CC BY-SA 4.0',
    stops: [
      { time: '08:30', type: 'bus', title: 'Assembly at hotel lobby', place: '[Hotel name]', note: '[Departure details to follow.]' },
      { time: '09:30', type: 'tour', title: '[Binondo heritage walk]', place: 'Binondo, Manila', note: '[Route to follow.]', image: binondoPhoto },
      { time: '11:30', type: 'meal', title: '[Food crawl]', place: 'Binondo, Manila', note: '[Stops to follow.]' },
      { time: '15:00', type: 'free', title: 'Free afternoon', place: 'Your choice', note: 'Rest up for the big night.' },
    ],
  },
  {
    date: '2026-12-05',
    title: 'Silver Horizons Night',
    area: 'Parañaque City',
    blurb: 'The 25th anniversary and Christmas party at East Ocean Palace.',
    image: nightPhoto,
    credit: 'Manila Bay at night — Ralff Nestor Nacor, CC BY-SA 4.0',
    stops: [
      { time: '10:00', type: 'free', title: 'Free morning', place: 'Hotel', note: 'Brunch and prep time.' },
      { time: '15:30', type: 'bus', title: 'Bus departure to venue', place: 'Hotel lobby', note: '[Details to follow.]' },
      { time: '17:00', type: 'party', title: 'Silver Horizons anniversary & Christmas party', place: 'East Ocean Palace, Parañaque City', note: 'The anniversary and Christmas party. Program to follow.', image: nightPhoto },
    ],
  },
]
