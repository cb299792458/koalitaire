import type { CardParams, Suit } from "../../models/Card";
import allCards from "../cardParams";

const koaDeck: CardParams[] = Object.entries(allCards).map(([suit, cards]) => {
    return cards.map((card, index) => ({
        ...card,
        suit: suit as Suit,
        rank: index + 1,
    }));
}).flat();

export default koaDeck;
