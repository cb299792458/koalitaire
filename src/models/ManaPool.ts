import type Card from "./Card";
import type { Suit } from "./Card";

class ManaPool {
    suit: Suit;
    cards: Card[] = [];

    constructor(suit: Suit) {
        this.suit = suit;
        this.cards = [];
    }

    /**
     * Add a card to the mana pool
     */
    addCard(card: Card): void {
        if (card.suit !== this.suit) {
            throw new Error(`Cannot add ${card.suit} card to ${this.suit} mana pool`);
        }
        this.cards.push(card);
    }

    /**
     * Remove a card from the mana pool
     * @returns true if card was found and removed, false otherwise
     */
    removeCard(card: Card): boolean {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get the count of available mana (number of cards in the pool)
     */
    getManaCount(): number {
        return this.cards.length;
    }

    /**
     * Check if there's enough mana for burning a card of a given rank
     * A card can be burned if the mana pool has a number of cards equal to (rank - 1)
     * This means cards can be placed if their rank is one more than the cards in the pile
     */
    hasEnoughManaForBurn(rank: number): boolean {
        const count = this.getManaCount();
        return count === rank - 1;
    }
}


export default ManaPool
