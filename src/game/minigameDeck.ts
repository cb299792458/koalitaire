import type Card from "../models/Card";
import type Player from "../models/Player";
import { shuffleInPlace } from "./blackjack";

/** Shuffled combat-deck snapshot for a minigame (new card instances each call). */
export function buildShuffledCombatDeck(player: Player, reveal = false): Card[] {
    const deck = shuffleInPlace(player.getCombatDeck());
    for (const card of deck) {
        card.revealed = reveal;
    }
    return deck;
}
