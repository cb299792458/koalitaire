import type Card from "./Card";
import type DrawPile from "./DrawPile";
import CardGroup from "./CardGroup";

class CompostPile extends CardGroup {
    constructor(cards: Card[] = []) {
        super(cards);
    }

    /**
     * Add a card to the compost pile
     */
    addCard(card: Card): void {
        this.add(card);
    }

    /**
     * Add multiple cards to the compost pile
     */
    addCards(cards: Card[]): void {
        this.cards.push(...cards);
    }

    /**
     * Get the number of cards in the compost pile
     */
    getCount(): number {
        return this.size();
    }

    /**
     * Check if the compost pile is empty
     */
    isEmpty(): boolean {
        return this.cards.length === 0;
    }

    /**
     * Transfer all cards from compost to the draw pile (recycling)
     */
    recycleInto(drawPile: DrawPile): void {
        while (this.cards.length > 0) {
            const card = this.cards.pop();
            if (card) {
                drawPile.addCard(card);
            }
        }
    }

    /**
     * Clear all cards from the compost pile
     */
    clear(): void {
        this.cards = [];
    }
}

export default CompostPile;
