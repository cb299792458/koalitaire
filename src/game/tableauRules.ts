import type Card from "../models/Card";
import type { Suit } from "../models/Suit";

export function cardHasSuit(card: Pick<Card, "suit">): card is Card & { suit: Suit } {
    return card.suit !== null;
}

/**
 * True if `moving` may be placed on top of `onto` (onto is the current top of the column).
 * Unsuited cards skip the alternating-suit rule: they may sit on any suited card of the right rank,
 * and any suited or unsuited card of the right rank may sit on an unsuited card.
 */
export function canPlaceCardOnTableau(moving: Card, onto: Card): boolean {
    if (moving.rank !== onto.rank - 1) return false;
    if (!cardHasSuit(onto)) return true;
    if (!cardHasSuit(moving)) return true;
    return moving.suit !== onto.suit;
}

/** Column order: index 0 = bottom, last index = top. Validates each card on the one below. */
export function isValidTableauRun(cards: Card[]): boolean {
    for (let i = 1; i < cards.length; i++) {
        const onto = cards[i - 1]!;
        const moving = cards[i]!;
        if (!canPlaceCardOnTableau(moving, onto)) return false;
    }
    return true;
}
