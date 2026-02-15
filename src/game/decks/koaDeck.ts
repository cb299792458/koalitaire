import { Suit, Suits, type CardParams } from "../../models/Card";
import { starterCards } from "../cards/starterCards";

const manaCards =  [1, 2, 3, 4, 5, 6,].map((rank) => Suits.map((suit: Suit) => ({
    rank,
    suit,
}))).flat();

const koaDeck: CardParams[] = [...manaCards, ...starterCards];

export default koaDeck;
