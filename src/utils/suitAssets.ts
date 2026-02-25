import { Suit } from '../models/Suit';

export const suitIconMap: Record<Suit, string> = {
    [Suit.Wood]: '/icons/tree-svgrepo-com.svg',
    [Suit.Fire]: '/icons/fire-svgrepo-com.svg',
    [Suit.Earth]: '/icons/rock-svgrepo-com.svg',
    [Suit.Metal]: '/icons/metal-bar-svgrepo-com.svg',
    [Suit.Water]: '/icons/water-drop-svgrepo-com.svg',
    [Suit.Koala]: '/icons/koala.svg',
};

export const suitClassMap: Record<Suit, string> = {
    [Suit.Wood]: 'suit-wood',
    [Suit.Fire]: 'suit-fire',
    [Suit.Earth]: 'suit-earth',
    [Suit.Metal]: 'suit-metal',
    [Suit.Water]: 'suit-water',
    [Suit.Koala]: 'suit-koala',
};
