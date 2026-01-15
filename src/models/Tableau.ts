import CardGroup from "./CardGroup";
import DrawPile from "./DrawPile";
import type Card from "./Card";

class Tableau {
    columns: CardGroup[];

    constructor(tableauSize: number) {
        this.columns = Array.from({ length: tableauSize }, () => new CardGroup());
    }

    /**
     * Get a specific column by index
     */
    getColumn(index: number): CardGroup | undefined {
        return this.columns[index];
    }

    /**
     * Get all columns
     */
    getColumns(): CardGroup[] {
        return this.columns;
    }

    /**
     * Clear all columns
     */
    clear(): void {
        for (const column of this.columns) {
            column.cards = [];
        }
    }

    /**
     * Deal the original tableau from the draw pile.
     * Column 0 gets 1 card, column 1 gets 2 cards, etc.
     * The last card in each column is revealed.
     */
    deal(drawPile: DrawPile): void {
        for (let i = 0; i < this.columns.length; i++) {
            const column = this.columns[i];
            if (!column) continue;

            // Clear the column first
            column.cards = [];

            // Deal i+1 cards to column i
            for (let j = 0; j <= i; j++) {
                const card = drawPile.draw();
                if (card) {
                    column.add(card);
                }
            }

            // Reveal the last card in each tableau column
            if (column.size() > 0) {
                const lastCard = column.cards[column.size() - 1];
                if (lastCard) {
                    lastCard.revealed = true;
                }
            }
        }
    }

    /**
     * Get cards arrays for Vue template compatibility
     * Returns an array of Card[] arrays, one for each column
     */
    getCardsArrays(): Card[][] {
        return this.columns.map(column => column.cards);
    }
}

export default Tableau;
