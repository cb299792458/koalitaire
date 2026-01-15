import type Card from "./Card";

/**
 * Base class for groups of cards with common operations
 */
class CardGroup {
    cards: Card[] = [];

    constructor(cards: Card[] = []) {
        this.cards = [...cards];
    }

    /**
     * Add a card to the group
     */
    add(card: Card): void {
        this.cards.push(card);
    }

    /**
     * Remove a card from the group by reference
     * Returns true if the card was found and removed, false otherwise
     */
    remove(card: Card): boolean {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get the number of cards in the group
     */
    size(): number {
        return this.cards.length;
    }
}

export default CardGroup;
