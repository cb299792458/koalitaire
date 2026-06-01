import { ref, type Ref } from "vue";
import type Card from "../models/Card";
import { buildShuffledCombatDeck } from "../game/minigameDeck";
import {
    detectRatscrewPattern,
    type RatscrewPattern,
} from "../game/ratscrew";
import RatscrewMinigame, {
    RATSCREW_FALSE_SLAP_DAMAGE_BASE,
    RATSCREW_CREW_LABEL,
    RATSCREW_MISS_DAMAGE_BASE,
} from "../models/minigames/RatscrewMinigame";
import type Player from "../models/Player";
import { publishMinigameResult } from "./minigameResult";

export type RatscrewPhase = "intro" | "flipping" | "slap-window" | "complete";

/** Card is face-down on the deck (left) before flipping. */
export type RatscrewInFlightStage = "at-deck" | "revealed-at-deck" | "moving";

export interface RatscrewSession {
    phase: RatscrewPhase;
    shoe: Card[];
    pile: Card[];
    /** Card currently flipping on the deck or flying to the pile. */
    inFlightCard: Card | null;
    inFlightStage: RatscrewInFlightStage | null;
    cardsFlipped: number;
    cardsTotal: number;
    misses: number;
    falseSlaps: number;
    correctSlaps: number;
    activePattern: RatscrewPattern | null;
    roundMessage: string;
    canSlap: boolean;
}

/** Flip face-up while the card sits on the deck (left). */
const RATSCREW_DECK_FLIP_MS = 500;
/** Brief pause showing the revealed card on the deck. */
const RATSCREW_DECK_HOLD_MS = 180;
/** Slide from deck to pile (right). */
const RATSCREW_FLY_MS = 450;
const RATSCREW_CARD_CYCLE_MS =
    RATSCREW_DECK_FLIP_MS + RATSCREW_DECK_HOLD_MS + RATSCREW_FLY_MS;

const FLIP_INTERVAL_MS = RATSCREW_CARD_CYCLE_MS + 180;
const SLAP_WINDOW_MS = 2200;
const AFTER_SLAP_MS = 450;
const AFTER_MISS_MS = 450;
const FIRST_FLIP_DELAY_MS = 500;

const sessionRef = ref<RatscrewSession | null>(null);
let animationToken = 0;
let activePlayer: Player | null = null;
let activeMinigame: RatscrewMinigame | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;
/** Separate from flip animation timers so hold/fly steps do not cancel the miss timeout. */
let slapWindowTimer: ReturnType<typeof setTimeout> | null = null;

function clearSlapWindowTimer(): void {
    if (slapWindowTimer != null) {
        clearTimeout(slapWindowTimer);
        slapWindowTimer = null;
    }
}

function cancelAnimation(): void {
    animationToken += 1;
    if (animationTimer != null) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    clearSlapWindowTimer();
}

function isAnimationActive(token: number): boolean {
    return animationToken === token && sessionRef.value != null;
}

function schedule(fn: () => void, ms: number): void {
    if (animationTimer != null) {
        clearTimeout(animationTimer);
    }
    animationTimer = setTimeout(() => {
        animationTimer = null;
        fn();
    }, ms);
}

const RATSCREW_MAX_CARDS = 20;

function buildShoe(player: Player): Card[] {
    const deck = buildShuffledCombatDeck(player, false);
    if (deck.length <= RATSCREW_MAX_CARDS) {
        return deck;
    }
    return deck.slice(0, RATSCREW_MAX_CARDS);
}

function crewSays(message: string): string {
    return `${RATSCREW_CREW_LABEL}: ${message}`;
}

function completeMinigameSuccess(session: RatscrewSession): void {
    session.phase = "complete";
    session.canSlap = false;
    session.activePattern = null;
    session.roundMessage = crewSays(
        "You slapped through the whole pile. The crew lets you limp away—with your deck."
    );
    publishMinigameResult(
        "You survived the pirate rats' Ratscrew round and keep your deck."
    );
}

function completeMinigameDefeat(message: string): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.canSlap = false;
    session.activePattern = null;
    session.roundMessage = crewSays(message);
    publishMinigameResult(message);
}

function applyMissDamage(session: RatscrewSession, player: Player): number {
    const minigame = activeMinigame;
    const damage = minigame
        ? minigame.damagePlayer(player, RATSCREW_MISS_DAMAGE_BASE)
        : 0;
    session.misses += 1;
    return damage;
}

function applyFalseSlapDamage(session: RatscrewSession, player: Player): number {
    const minigame = activeMinigame;
    const damage = minigame
        ? minigame.damagePlayer(player, RATSCREW_FALSE_SLAP_DAMAGE_BASE)
        : 0;
    session.falseSlaps += 1;
    return damage;
}

function checkPlayerAlive(player: Player): boolean {
    if (player.health <= 0) {
        completeMinigameDefeat("You fall before the crew flips the last card.");
        return false;
    }
    return true;
}

function scheduleNextFlip(session: RatscrewSession, delayMs: number): void {
    const token = animationToken;
    schedule(() => {
        if (!isAnimationActive(token)) return;
        flipNextCard(session, token);
    }, delayMs);
}

function openSlapWindow(
    session: RatscrewSession,
    pattern: RatscrewPattern,
    token: number
): void {
    session.phase = "slap-window";
    session.activePattern = pattern;
    session.canSlap = true;

    clearSlapWindowTimer();
    slapWindowTimer = setTimeout(() => {
        slapWindowTimer = null;
        if (!isAnimationActive(token) || session.phase !== "slap-window") return;
        const player = activePlayer;
        if (!player) return;

        session.canSlap = false;
        session.activePattern = null;
        session.phase = "flipping";

        const damage = applyMissDamage(session, player);
        session.roundMessage = crewSays(
            damage > 0
                ? `Too slow, swab! That'll cost you ${damage} damage.`
                : "Too slow, swab!"
        );

        if (!checkPlayerAlive(player)) return;

        clearInFlightVisual(session);
        scheduleNextFlip(session, AFTER_MISS_MS);
    }, SLAP_WINDOW_MS);
}

function clearInFlightVisual(session: RatscrewSession): void {
    session.inFlightCard = null;
    session.inFlightStage = null;
}

function commitCardToPile(session: RatscrewSession, card: Card, token: number): void {
    session.pile.push(card);
    session.cardsFlipped += 1;
    session.roundMessage = crewSays(
        `Card ${session.cardsFlipped} of ${session.cardsTotal} on the pile…`
    );

    const pattern = detectRatscrewPattern(session.pile);
    if (pattern) {
        openSlapWindow(session, pattern, token);
    }
}

function finishInFlightAnimation(session: RatscrewSession, token: number): void {
    clearInFlightVisual(session);

    if (session.phase === "slap-window") {
        return;
    }

    if (session.shoe.length === 0) {
        schedule(() => {
            if (!isAnimationActive(token)) return;
            completeMinigameSuccess(session);
        }, FLIP_INTERVAL_MS);
        return;
    }

    scheduleNextFlip(session, FLIP_INTERVAL_MS);
}

function flipNextCard(session: RatscrewSession, token: number): void {
    if (!isAnimationActive(token) || session.phase === "complete") return;

    if (session.shoe.length === 0) {
        completeMinigameSuccess(session);
        return;
    }

    session.phase = "flipping";
    session.canSlap = false;
    session.activePattern = null;

    const card = session.shoe.shift()!;
    card.revealed = false;
    session.inFlightCard = card;
    session.inFlightStage = "at-deck";
    session.roundMessage = crewSays("Another card off the deck…");

    schedule(() => {
        if (!isAnimationActive(token)) return;

        session.inFlightStage = "revealed-at-deck";
        commitCardToPile(session, card, token);

        schedule(() => {
            if (!isAnimationActive(token)) return;

            card.revealed = true;

            schedule(() => {
                if (!isAnimationActive(token)) return;

                session.inFlightStage = "moving";

                schedule(() => {
                    if (!isAnimationActive(token)) return;
                    finishInFlightAnimation(session, token);
                }, RATSCREW_FLY_MS);
            }, RATSCREW_DECK_HOLD_MS);
        }, RATSCREW_DECK_FLIP_MS);
    }, RATSCREW_DECK_FLIP_MS);
}

function slapCorrect(session: RatscrewSession, token: number): void {
    if (animationTimer != null) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    clearSlapWindowTimer();

    session.canSlap = false;
    session.activePattern = null;
    session.correctSlaps += 1;
    session.phase = "flipping";
    session.roundMessage = crewSays("Sharp slap! The crew approves.");
    clearInFlightVisual(session);

    const player = activePlayer;
    if (player && !checkPlayerAlive(player)) return;

    if (session.shoe.length === 0) {
        schedule(() => {
            if (!isAnimationActive(token)) return;
            completeMinigameSuccess(session);
        }, AFTER_SLAP_MS);
        return;
    }

    scheduleNextFlip(session, AFTER_SLAP_MS);
}

function slapErroneous(session: RatscrewSession): void {
    const player = activePlayer;
    if (!player) return;

    const damage = applyFalseSlapDamage(session, player);
    session.roundMessage = crewSays(
        damage > 0
            ? `Slap-happy fool! ${damage} damage.`
            : "Slap-happy fool!"
    );

    checkPlayerAlive(player);
}

function slap(): void {
    const session = sessionRef.value;
    const token = animationToken;
    if (!session || session.phase === "complete" || session.phase === "intro") return;

    if (session.phase === "slap-window" && session.canSlap) {
        slapCorrect(session, token);
        return;
    }

    if (session.phase === "flipping") {
        if (detectRatscrewPattern(session.pile)) {
            slapCorrect(session, token);
            return;
        }
        slapErroneous(session);
    }
}

function startFlipping(session: RatscrewSession): void {
    session.phase = "flipping";
    session.roundMessage = crewSays("Eyes on the pile, landlubber.");
    scheduleNextFlip(session, FIRST_FLIP_DELAY_MS);
}

function beginPlay(): void {
    const session = sessionRef.value;
    if (!session || session.phase !== "intro") return;
    startFlipping(session);
}

export function useRatscrew(): {
    session: Ref<RatscrewSession | null>;
    startRatscrew: (player: Player, minigame: RatscrewMinigame) => void;
    resetRatscrew: () => void;
    beginPlay: () => void;
    slap: () => void;
} {
    return {
        session: sessionRef,
        startRatscrew(player: Player, minigame: RatscrewMinigame) {
            cancelAnimation();
            activePlayer = player;
            activeMinigame = minigame;

            const shoe = buildShoe(player);
            if (shoe.length === 0) {
                sessionRef.value = {
                    phase: "complete",
                    shoe: [],
                    pile: [],
                    inFlightCard: null,
                    inFlightStage: null,
                    cardsFlipped: 0,
                    cardsTotal: 0,
                    misses: 0,
                    falseSlaps: 0,
                    correctSlaps: 0,
                    activePattern: null,
                    roundMessage: crewSays("No cards? Come back with a deck to plunder."),
                    canSlap: false,
                };
                completeMinigameDefeat(
                    "Your deck was empty—the pirate rats have nothing to flip."
                );
                return;
            }

            sessionRef.value = {
                phase: "intro",
                shoe,
                pile: [],
                inFlightCard: null,
                inFlightStage: null,
                cardsFlipped: 0,
                cardsTotal: shoe.length,
                misses: 0,
                falseSlaps: 0,
                correctSlaps: 0,
                activePattern: null,
                roundMessage: crewSays("The crew's ready. Don't blink."),
                canSlap: false,
            };
        },
        beginPlay,
        resetRatscrew() {
            cancelAnimation();
            activePlayer = null;
            activeMinigame = null;
            sessionRef.value = null;
        },
        slap,
    };
}

export function startRatscrewSession(player: Player, minigame: RatscrewMinigame): void {
    useRatscrew().startRatscrew(player, minigame);
}

export function resetRatscrewSession(): void {
    useRatscrew().resetRatscrew();
}
