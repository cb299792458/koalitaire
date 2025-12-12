import type Card from "./Card";
import type { Suit } from "./Card";

class ManaPool {
    suit: Suit;
    cards: Card[] = [];

    constructor(suit: Suit) {
        this.suit = suit;
        this.cards = [];
    }

}


export default ManaPool
