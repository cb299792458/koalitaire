import Card, { SpellCard } from "../models/Card";
import type Player from "../models/Player";
import { shuffleInPlace } from "./blackjack";
import { buildShuffledCombatDeck } from "./minigameDeck";

export const MEMORY_PAIR_COUNT = 8;

export interface MemorySlot {
    id: number;
    card: Card;
    matched: boolean;
}

/** Two memory cards match when rank, suit, and name (spells) align. */
export function memoryCardsMatch(a: Card, b: Card): boolean {
    if (a.rank !== b.rank || a.suit !== b.suit || a.isSpell !== b.isSpell) {
        return false;
    }
    if (a.isSpell && b.isSpell) {
        return (a as SpellCard).name === (b as SpellCard).name;
    }
    return true;
}

/** Duplicate a deck card for a face-down memory pair (new instance, not revealed). */
export function cloneMemoryCard(source: Card): Card {
    if (source.isSpell) {
        const spell = source as SpellCard;
        const copy = new SpellCard(
            spell.rank,
            spell.suit,
            spell.name,
            spell.description,
            spell.effect,
            spell.charges,
            spell.keywords,
            spell.flavorText,
            spell.castAnimationDirection
        );
        copy.revealed = false;
        return copy;
    }
    const copy = new Card(source.rank, source.suit);
    copy.revealed = false;
    return copy;
}

/** Pick eight cards from the combat deck (with replacement if the deck is small) and build sixteen shuffled slots. */
export function buildMemoryBoard(player: Player): MemorySlot[] {
    const deck = buildShuffledCombatDeck(player);
    if (deck.length === 0) {
        throw new Error("Memory minigame: combat deck is empty");
    }

    const picked: Card[] = [];
    for (let i = 0; i < MEMORY_PAIR_COUNT; i++) {
        picked.push(deck[Math.floor(Math.random() * deck.length)]!);
    }

    const slots: MemorySlot[] = [];
    let nextId = 0;
    for (let i = 0; i < MEMORY_PAIR_COUNT; i++) {
        const template = picked[i]!;
        slots.push({ id: nextId++, card: cloneMemoryCard(template), matched: false });
        slots.push({ id: nextId++, card: cloneMemoryCard(template), matched: false });
    }

    return shuffleInPlace(slots);
}

export function memorySlotsRemaining(slots: readonly MemorySlot[]): number {
    return slots.filter((s) => !s.matched).length;
}
