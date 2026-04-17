import type Card from "./Card";
import type DrawPile from "./DrawPile";
import CardGroup from "./CardGroup";

class RecyclingPile extends CardGroup {
    constructor(cards: Card[] = []) {
        super(cards);
    }

    addCard(card: Card): void {
        this.add(card);
    }

    addCards(cards: Card[]): void {
        this.cards.push(...cards);
    }

    getCount(): number {
        return this.size();
    }

    isEmpty(): boolean {
        return this.cards.length === 0;
    }

    /** Move all cards from this pile into the draw pile (e.g. end of turn / reshuffle). */
    recycleInto(drawPile: DrawPile): void {
        while (this.cards.length > 0) {
            const card = this.cards.pop();
            if (card) {
                drawPile.addCard(card);
            }
        }
    }

    clear(): void {
        this.cards = [];
    }
}

export default RecyclingPile;
