import Card from "../models/Card";
import { Suits } from "../models/Suit";
import { shuffleInPlace } from "./blackjack";

export type WarCompareResult = "player" | "opponent" | "tie";

/** Rank used for War comparisons (ace = 1). */
export function warCardValue(card: Card): number {
    if (card.rank === 1) return 1;
    if (card.rank >= 10) return card.rank;
    if (card.rank <= 0) return 0;
    return card.rank;
}

export function compareWarCards(
    playerCard: Card,
    opponentCard: Card
): WarCompareResult {
    const playerValue = warCardValue(playerCard);
    const opponentValue = warCardValue(opponentCard);
    if (playerValue > opponentValue) return "player";
    if (playerValue < opponentValue) return "opponent";
    return "tie";
}

export function warDamageOnLoss(playerCard: Card, opponentCard: Card): number {
    return Math.max(0, warCardValue(opponentCard) - warCardValue(playerCard));
}

export function createOpponentWarCard(): Card {
    const suit = Suits[Math.floor(Math.random() * Suits.length)]!;
    const rank = 1 + Math.floor(Math.random() * 9);
    const card = new Card(rank, suit);
    card.revealed = false;
    return card;
}

export function buildOpponentWarDeck(cardCount: number): Card[] {
    const deck: Card[] = [];
    for (let i = 0; i < cardCount; i++) {
        deck.push(createOpponentWarCard());
    }
    return shuffleInPlace(deck);
}

export function drawFromPileTop(pile: Card[], reveal = true): Card | null {
    const card = pile.shift();
    if (!card) return null;
    card.revealed = reveal;
    return card;
}

export function addCardsToPileBottom(pile: Card[], cards: readonly Card[]): void {
    pile.push(...cards);
}
