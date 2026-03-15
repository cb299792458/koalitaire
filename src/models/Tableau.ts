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
     * Deal the entire draw pile evenly into all columns (round-robin). Deck is left empty.
     * All tableau cards are dealt face up.
     */
    deal(drawPile: DrawPile): void {
        for (const column of this.columns) {
            column.cards = [];
        }
        let col = 0;
        const numCols = this.columns.length;
        if (numCols === 0) return;
        for (;;) {
            const card = drawPile.draw();
            if (!card) break;
            card.revealed = true;
            const column = this.columns[col];
            if (column) column.add(card);
            col = (col + 1) % numCols;
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
