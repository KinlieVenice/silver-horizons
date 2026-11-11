// SAMPLE people (fictional names) until the registration list and the line-up come in. Later the backend
// serves this per signed-in person: `attending` lists only the events that person is registered for, each
// with everyone else registered for it.
// image: optional photo (import it like the itinerary photos); without one a chrome monogram shows.
import { branches } from './branches.js'

// photos in assets/people, named after the person ('Shirley De Jesus' → shirley-de-jesus.webp): cut-outs on a
// transparent background (IMG.LY background removal), shown on the card's silver gradient
const photoFiles = import.meta.glob('../assets/people/*.webp', { eager: true, import: 'default' })
const slug = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const withPhoto = (p) => ({ ...p, image: photoFiles[`../assets/people/${slug(p.name)}.webp`] ?? p.image })

const first = ['Andrea', 'Paolo', 'Bea', 'Carlo', 'Danica', 'Enzo', 'Faye', 'Gabriel', 'Hannah', 'Iñigo', 'Jasmine', 'Kevin', 'Lara', 'Miguel', 'Nicole', 'Oscar', 'Patricia', 'Rafael', 'Sofia', 'Tristan', 'Ursula', 'Vince', 'Wendy', 'Xavier', 'Ysabel', 'Zach', 'Aira', 'Bryan', 'Celine', 'Dominic', 'Ella', 'Francis']
const last = ['Reyes', 'Santos', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Villanueva', 'Ramos', 'Aquino', 'Navarro', 'Castillo', 'Flores', 'Dela Cruz', 'Gonzales', 'Lim', 'Tan', 'Rivera', 'Domingo', 'Salazar', 'Pascual', 'Manalo', 'Ocampo', 'Fernandez', 'Soriano', 'Valdez', 'Mercado', 'Lopez', 'Javier']
const offices = [...branches.map((b) => b.name), 'Head Office']

// ponytail: generated sample list; the real one comes from registration
const everyone = Array.from({ length: 72 }, (_, i) => ({
  name: `${first[(i * 7) % first.length]} ${last[(i * 11) % last.length]}`,
  branch: offices[(i * 5) % offices.length],
})).sort((a, b) => a.name.localeCompare(b.name))

// The events this (sample) person is registered for. Each event carries its own lists; a list left empty
// (or out) means that event doesn't show in that tab, and a tab with nothing in any event doesn't show at all.
// group: the heading a card sits under (Hosts, Speakers, Guides; Headliner, Line-up …), in the order given.
// secret: an act still under wraps (a sparkle instead of a face); spotlight: the headliner's wide card.
const night = everyone
const events_ = [
  {
    id: 'night', title: 'Silver Horizons Night', when: 'Sat, Dec 5',
    attending: night,
    hosts: [
      { name: 'Andrea Villanueva', group: 'Hosts', role: 'Host', note: 'Your host for the night' },
      { name: 'Paolo Mercado', group: 'Hosts', role: 'Host', note: 'Your host for the night' },
      { name: 'Ramon Castillo', group: 'Speakers', role: 'Speaker', note: 'Opening remarks' },
      { name: 'Teresa Aquino', group: 'Speakers', role: 'Speaker', note: 'Silver Pioneers Award' },
      { name: 'Leo Navarro', group: 'Speakers', role: 'Speaker', note: 'Summit toast' },
    ],
    performers: [
      { name: 'To be revealed', group: 'Headliner', role: 'Headliner', note: 'Part 3: Beyond the Summit · 8:40 PM', secret: true, spotlight: true },
      { name: 'To be revealed', group: 'Line-up', role: 'Opening performance', note: 'Part 1: Ascent · 5:15 PM', secret: true },
      { name: 'To be revealed', group: 'Line-up', role: 'Performer 1', note: 'During dinner · 6:30 PM', secret: true },
    ],
    committee: [
      { name: 'Aikel De Guzman', role: 'Organizer' },
      { name: 'Crisselita Mismanos', role: 'Organizer' },
      { name: 'Eva Dy', role: 'Organizer' },
      { name: 'Faith Batalla', role: 'Organizer' },
      { name: 'Faith Gonzales', role: 'Organizer' },
      { name: 'Jay-R Sombero', role: 'Organizer' },
      { name: 'John Montalvan', role: 'Organizer' },
      { name: 'Karen Yao', role: 'Organizer' },
      { name: 'Lady Jill Sabado', role: 'Organizer' },
      { name: 'Quennie May Pastrana', role: 'Organizer' },
      { name: 'Richmond Ronquillo', role: 'Organizer' },
      { name: 'Shirley De Jesus', role: 'Organizer' },
    ],
  },
  {
    id: 'royu', title: 'Royu Tour', when: 'Thu, Dec 3',
    attending: night.filter((_, i) => i % 3 === 0),
    hosts: [{ name: 'Marco Valdez', group: 'Guides', role: 'Tour guide', note: 'Orientation and plant tour' }],
  },
  {
    id: 'museum', title: 'FELCO Explores Manila: National Museum', when: 'Fri, Dec 4',
    attending: night.filter((_, i) => i % 2 === 1),
    hosts: [{ name: 'Clara Pascual', group: 'Guides', role: 'Museum guide', note: 'Natural History, then Fine Arts' }],
  },
  {
    id: 'zen', title: 'Zen Office Tour', when: 'Fri, Dec 4',
    attending: night.filter((_, i) => i % 4 !== 2),
    hosts: [{ name: 'Gabriel Tan', group: 'Hosts', role: 'Host', note: 'Welcome on the 11th floor' }],
  },
]

// every card gets its photo when there's a file for that name
export const events = events_.map((e) => ({
  ...e,
  ...Object.fromEntries(['hosts', 'performers', 'committee'].filter((k) => e[k]).map((k) => [k, e[k].map(withPhoto)])),
}))
