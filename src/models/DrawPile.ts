import type Card from "./Card";

class DrawPile {
    cards: Card[] = [];

    constructor(cards: Card[] = []) {
        this.cards = [...cards];
    }

    /**
     * Add a card to the bottom of the draw pile
     */
    addCard(card: Card): void {
        this.cards.push(card);
    }

    /**
     * Add multiple cards to the draw pile
     */
    addCards(cards: Card[]): void {
        this.cards.push(...cards);
    }

    /**
     * Draw (remove and return) a card from the top of the draw pile
     */
    draw(): Card | null {
        return this.cards.pop() || null;
    }

    /**
     * Draw multiple cards from the top
     */
    drawMultiple(count: number): Card[] {
        const drawn: Card[] = [];
        for (let i = 0; i < count; i++) {
            const card = this.draw();
            if (card) {
                drawn.push(card);
            } else {
                break; // No more cards to draw
            }
        }
        return drawn;
    }

    /**
     * Get the number of cards in the draw pile
     */
    getCount(): number {
        return this.cards.length;
    }

    /**
     * Check if the draw pile is empty
     */
    isEmpty(): boolean {
        return this.cards.length === 0;
    }

    /**
     * Shuffle the draw pile
     */
    shuffle(): void {
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j]!, this.cards[i]!];
        }
        // Set all cards as not revealed when shuffling
        for (const card of this.cards) {
            card.revealed = false;
        }
    }

    /**
     * Clear all cards from the draw pile
     */
    clear(): void {
        this.cards = [];
    }

    /**
     * Initialize the draw pile with cards (replaces existing cards)
     */
    initialize(cards: Card[]): void {
        this.cards = [...cards];
    }
}

export default DrawPile;
