import type { CardParams, Suit } from "../../models/Card";
import allCards from "../cardParams";

const koaDeck: CardParams[] = Object.entries(allCards).map(([suit, cards]) => {
    return cards.map((card, rank) => ({
        ...card,
        suit: suit as Suit,
        rank,
    }));
}).flat();

export default koaDeck;
