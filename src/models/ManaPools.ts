import type DrawPile from './DrawPile';
import type { Suit } from './Suit';
import { Suits } from './Suit';
import ManaPool from './ManaPool';

/** Collection of one ManaPool per suit, in Suits order. */
export default class ManaPools {
    private poolBySuit: Map<Suit, ManaPool>;

    constructor() {
        this.poolBySuit = new Map(Suits.map(suit => [suit, new ManaPool(suit)]));
    }

    get(suit: Suit): ManaPool {
        const pool = this.poolBySuit.get(suit);
        if (!pool) throw new Error(`No mana pool for suit ${suit}`);
        return pool;
    }

    /** Returns the pool for the suit, or undefined if none (e.g. Koala or null suit). */
    getPool(suit: Suit | null): ManaPool | undefined {
        if (suit === null) return undefined;
        return this.poolBySuit.get(suit);
    }

    clear(): void {
        for (const pool of this.poolBySuit.values()) {
            pool.clear();
        }
    }

    /** Move every card from all elemental pools into the draw pile (e.g. end turn when compost cycle runs). */
    recycleAllInto(drawPile: DrawPile): void {
        for (const suit of Suits) {
            const pool = this.get(suit);
            const cards = [...pool.cards];
            pool.clear();
            drawPile.addCards(cards);
        }
    }

    /** Pairs [suit, pool] in Suits order (for iteration with index). */
    entries(): [Suit, ManaPool][] {
        return Suits.map(suit => [suit, this.get(suit)]);
    }

    /** All pools in Suits order. */
    pools(): ManaPool[] {
        return Suits.map(suit => this.get(suit));
    }
}
