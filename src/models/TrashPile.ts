import type Card from "./Card";

class TrashPile {
    cards: Card[] = [];

    constructor(cards: Card[] = []) {
        this.cards = [...cards];
    }

    /**
     * Add a card to the trash pile
     */
    addCard(card: Card): void {
        this.cards.push(card);
    }

    /**
     * Add multiple cards to the trash pile
     */
    addCards(cards: Card[]): void {
        this.cards.push(...cards);
    }

    /**
     * Get the number of cards in the trash pile
     */
    getCount(): number {
        return this.cards.length;
    }

    /**
     * Check if the trash pile is empty
     */
    isEmpty(): boolean {
        return this.cards.length === 0;
    }

    /**
     * Clear all cards from the trash pile
     */
    clear(): void {
        this.cards = [];
    }
}

export default TrashPile;
