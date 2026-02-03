import { Suit, type CardParams } from "../../models/Card";
// import allCards from "../cardParams";

// const koaDeck: CardParams[] = Object.entries(allCards).map(([suit, cards]) => {
//     return cards.map((card, rank) => ({
//         ...card,
//         suit: suit as Suit,
//         rank,
//     }));
// }).flat();

const koaDeck: CardParams[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((rank) => [Suit.Wood, Suit.Fire, Suit.Earth, Suit.Metal, Suit.Water].map((suit) => ({
    rank,
    suit,
    name: '',
    description: '',
    effect: () => {},
}))).flat();
export default koaDeck;
