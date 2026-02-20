import type Card from "./Card";
import CardGroup from "./CardGroup";
import { playSoundAndWait } from "../utils/sounds";

class DrawPile extends CardGroup {
    constructor(cards: Card[] = []) {
        super(cards);
    }

    /**
     * Add a card to the bottom of the draw pile
     */
    addCard(card: Card): void {
        this.add(card);
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
     * Draw multiple cards from the top. Use Infinity to draw the whole deck.
     */
    drawMultiple(count: number): Card[] {
        const drawn: Card[] = [];
        const limit = count === Infinity ? Number.MAX_SAFE_INTEGER : count;
        for (let i = 0; i < limit; i++) {
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
        return this.size();
    }

    /**
     * Check if the draw pile is empty
     */
    isEmpty(): boolean {
        return this.cards.length === 0;
    }

    /**
     * Shuffle the draw pile. Waits for shuffle sound to finish before resolving.
     */
    async shuffle(): Promise<void> {
        await playSoundAndWait('shuffle');
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
