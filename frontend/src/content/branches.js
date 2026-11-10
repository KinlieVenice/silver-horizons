// FELCO branches, from FELCO's branch map. x, y are in the traced map's space (phMap, 460 × 667),
// converted from the branch map's pin positions. group: island group (Palawan counts as Luzon).
// side: which side of the dot the label sits.
export const hub = { name: 'Manila', x: 193, y: 200 }

// the map plays one island group at a time, in this order
export const groups = [
  { id: 'luzon', name: 'Luzon' },
  { id: 'visayas', name: 'Visayas' },
  { id: 'mindanao', name: 'Mindanao' },
]

export const branches = [
  { name: 'Ilocos', x: 171, y: 41, group: 'luzon', side: 'left' },
  { name: 'Isabela', x: 244, y: 73, group: 'luzon', side: 'right' },
  { name: 'Urdaneta', x: 182, y: 122, group: 'luzon', side: 'left' },
  { name: 'Calumpit', x: 203, y: 167, group: 'luzon', side: 'right' },
  { name: 'Lingunan', x: 195, y: 192, group: 'luzon', side: 'left' },
  { name: 'Dulalia', x: 199, y: 189, group: 'luzon', side: 'right' },
  { name: 'Carmona', x: 201, y: 211, group: 'luzon', side: 'right' },
  { name: 'Naga', x: 301, y: 246, group: 'luzon', side: 'right' },
  { name: 'Palawan', x: 85, y: 428, group: 'luzon', side: 'left' },
  { name: 'Iloilo', x: 269, y: 375, group: 'visayas', side: 'left' },
  { name: 'Bacolod', x: 288, y: 401, group: 'visayas', side: 'left' },
  { name: 'Cebu', x: 328, y: 397, group: 'visayas', side: 'right' },
  { name: 'Tacloban', x: 376, y: 362, group: 'visayas', side: 'right' },
  { name: 'Cagayan de Oro', x: 361, y: 491, group: 'mindanao', side: 'right' },
  { name: 'Pagadian City', x: 305, y: 519, group: 'mindanao', side: 'left' },
  { name: 'Davao', x: 407, y: 553, group: 'mindanao', side: 'right' },
  { name: 'General Santos', x: 386, y: 602, group: 'mindanao', side: 'left' },
]
