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

    /** Returns the pool for the suit, or undefined if none (e.g. Koala). */
    getPool(suit: Suit): ManaPool | undefined {
        return this.poolBySuit.get(suit);
    }

    clear(): void {
        for (const pool of this.poolBySuit.values()) {
            pool.clear();
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
