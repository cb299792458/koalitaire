export const AREAS = {
  Deck: 'deck',
  Compost: 'compost',
  Trash: 'trash',
  Hand: 'hand',
  Tableau: 'tableau',
  ManaPools: 'manaPools',
  Board: 'board',
  'Burn Card': 'Burn Card',
} as const

export type Area = (typeof AREAS)[keyof typeof AREAS]
