import type Card from "./Card";
import CardGroup from "./CardGroup";

class Hand extends CardGroup {
    constructor() {
        super([]);
    }

    addCard(card: Card) {
        this.add(card);
    }

    clear() {
        this.cards = [];
    }
}

export default Hand;
