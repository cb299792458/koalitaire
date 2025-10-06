export const AREAS = {
  Deck: 'deck',
  Compost: 'compost',
  Trash: 'trash',
  Hand: 'hand',
  Tableau: 'tableau',
  ManaPools: 'manaPools',
} as const

export type Area = (typeof AREAS)[keyof typeof AREAS]
