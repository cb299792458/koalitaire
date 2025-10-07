export const AREAS = {
  Deck: 'deck',
  Compost: 'compost',
  Trash: 'trash',
  Hand: 'hand',
  Tableau: 'tableau',
  ManaPools: 'manaPools',
  Board: 'board',
} as const

export type Area = (typeof AREAS)[keyof typeof AREAS]
