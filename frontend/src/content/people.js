// SAMPLE people (fictional names) until the registration list and the line-up come in. Later the backend
// serves this per signed-in person: `attending` lists only the events that person is registered for, each
// with everyone else registered for it.
// image: optional photo (import it like the itinerary photos); without one a chrome monogram shows.
import { branches } from './branches.js'

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
// secret: a headliner still under wraps: one wide spotlight card, no name, no photo.
const night = everyone
export const events = [
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
      { name: 'To be revealed', group: 'Headliner', role: 'Headliner', note: 'Part 3: Beyond the Summit', secret: true },
      { name: 'The Silverlines', group: 'Line-up', role: 'Opening performance', note: 'Part 1: Ascent' },
      { name: 'Lumen Dance Company', group: 'Line-up', role: 'Opening spectacle', note: 'Part 1: Ascent' },
      { name: 'Mara Ocampo', group: 'Line-up', role: 'Performer', note: 'During dinner' },
      { name: 'Kinetic Light Crew', group: 'Line-up', role: 'Summit lights', note: 'Part 3: Beyond the Summit' },
      { name: 'DJ Horizon', group: 'Line-up', role: 'DJ set', note: 'After Party' },
    ],
    committee: [
      { name: 'Bea Santos', role: 'Overall Chair' },
      { name: 'Carlo Reyes', role: 'Programme' },
      { name: 'Danica Flores', role: 'Registration' },
      { name: 'Enzo Ramos', role: 'Logistics & Travel' },
      { name: 'Faye Domingo', role: 'Creatives' },
      { name: 'Gabriel Tan', role: 'Communications' },
      { name: 'Hannah Lim', role: 'Awards' },
      { name: 'Iñigo Soriano', role: 'Technical' },
    ],
  },
  {
    id: 'royu', title: 'Royu Tour', when: 'Thu, Dec 3',
    attending: night.filter((_, i) => i % 3 === 0),
    hosts: [{ name: 'Marco Valdez', group: 'Guides', role: 'Tour guide', note: 'Plant tour and showroom' }],
    committee: [{ name: 'Enzo Ramos', role: 'Tour coordinator' }],
  },
  {
    id: 'museum', title: 'Manila Tour: National Museum', when: 'Fri, Dec 4',
    attending: night.filter((_, i) => i % 2 === 1),
    hosts: [{ name: 'Clara Pascual', group: 'Guides', role: 'Museum guide', note: 'Fine Arts, Anthropology, Natural History' }],
    committee: [{ name: 'Faye Domingo', role: 'Tour coordinator' }],
  },
  {
    id: 'zen', title: 'Zen Office Tour', when: 'Fri, Dec 4',
    attending: night.filter((_, i) => i % 4 !== 2),
    hosts: [{ name: 'Gabriel Tan', group: 'Hosts', role: 'Host', note: 'Welcome on the 11th floor' }],
  },
]
