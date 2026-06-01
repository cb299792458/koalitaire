import Card from "../models/Card";
import { Suits } from "../models/Suit";

export type BlackjackRoundResult = "player-win" | "dealer-win" | "tie";

/** Blackjack value for a single card (rank 1 = ace). */
export function cardBlackjackValue(rank: number): number {
    if (rank === 1) return 1;
    if (rank >= 10) return 10;
    if (rank <= 0) return 0;
    return rank;
}

/** Hand total; aces always count as 1. */
export function handTotal(cards: readonly Card[]): number {
    let total = 0;
    for (const card of cards) {
        total += cardBlackjackValue(card.rank);
    }
    return total;
}

export function isBust(cards: readonly Card[]): boolean {
    return handTotal(cards) > 21;
}

export function compareHands(
    playerCards: readonly Card[],
    dealerCards: readonly Card[]
): BlackjackRoundResult {
    const playerTotal = handTotal(playerCards);
    const dealerTotal = handTotal(dealerCards);
    if (playerTotal > dealerTotal) return "player-win";
    if (playerTotal < dealerTotal) return "dealer-win";
    return "tie";
}

export function shuffleInPlace<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i]!;
        array[i] = array[j]!;
        array[j] = tmp;
    }
    return array;
}

export function createDealerCard(): Card {
    const suit = Suits[Math.floor(Math.random() * Suits.length)]!;
    const rank = 1 + Math.floor(Math.random() * 9);
    const card = new Card(rank, suit);
    card.revealed = true;
    return card;
}

export function dealerShouldHit(cards: readonly Card[]): boolean {
    return handTotal(cards) < 17;
}
