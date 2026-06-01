import { ref, type Ref } from "vue";
import {
    buildMemoryBoard,
    memoryCardsMatch,
    memorySlotsRemaining,
    type MemorySlot,
} from "../game/memory";
import { revealWithDealAnimation } from "../game/minigameCardAnimation";
import MemoryMinigame, {
    MEMORY_MISMATCH_DAMAGE_BASE,
} from "../models/minigames/MemoryMinigame";
import type Player from "../models/Player";
import { publishMinigameResult } from "./minigameResult";

export type MemoryPhase = "intro" | "playing" | "resolving" | "complete";

export interface MemorySession {
    slots: MemorySlot[];
    phase: MemoryPhase;
    firstPickId: number | null;
    roundMessage: string;
    canPick: boolean;
}

/** Time to flip the second card face-up before judging the pair. */
const SECOND_REVEAL_MS = 500;
const MISMATCH_SHOW_MS = 1100;
/** Both cards stay face-up this long before matched pairs leave the board. */
const MATCH_SHOW_MS = 900;
const WIN_COMPLETE_MS = 500;

const sessionRef = ref<MemorySession | null>(null);
let memoryAnimationToken = 0;
let activePlayer: Player | null = null;
let activeMinigame: MemoryMinigame | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;

function cancelMemoryAnimation(): void {
    memoryAnimationToken += 1;
    if (animationTimer != null) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
}

function isAnimationActive(token: number): boolean {
    return memoryAnimationToken === token && sessionRef.value != null;
}

function scheduleAnimation(fn: () => void, ms: number): void {
    if (animationTimer != null) {
        clearTimeout(animationTimer);
    }
    animationTimer = setTimeout(() => {
        animationTimer = null;
        fn();
    }, ms);
}

function slotById(session: MemorySession, id: number): MemorySlot | undefined {
    return session.slots.find((s) => s.id === id);
}

function setPickable(session: MemorySession, canPick: boolean): void {
    session.canPick = canPick && session.phase === "playing";
}

function completeMinigameSuccess(): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.roundMessage = "All pairs matched! You leave the trial victorious.";
    session.canPick = false;
    session.firstPickId = null;
    publishMinigameResult("You matched every pair and complete the memory trial.");
}

function completeMinigameDefeat(message: string): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.roundMessage = message;
    session.canPick = false;
    session.firstPickId = null;
    publishMinigameResult(message);
}

function checkPlayerAlive(player: Player): boolean {
    if (player.health <= 0) {
        completeMinigameDefeat("You fall before clearing the board.");
        return false;
    }
    return true;
}

function checkBoardCleared(session: MemorySession, token: number): void {
    if (memorySlotsRemaining(session.slots) > 0) return;
    scheduleAnimation(() => {
        if (!isAnimationActive(token)) return;
        completeMinigameSuccess();
    }, WIN_COMPLETE_MS);
}

function finishMismatch(
    session: MemorySession,
    first: MemorySlot,
    second: MemorySlot,
    token: number
): void {
    const player = activePlayer;
    const minigame = activeMinigame;
    if (!player || !minigame) return;

    scheduleAnimation(() => {
        if (!isAnimationActive(token)) return;

        const damage = minigame.damagePlayer(player, MEMORY_MISMATCH_DAMAGE_BASE);
        session.roundMessage =
            damage > 0
                ? `No match — you take ${damage} damage.`
                : "No match.";

        scheduleAnimation(() => {
            if (!isAnimationActive(token)) return;
            first.card.revealed = false;
            second.card.revealed = false;
            session.firstPickId = null;
            session.phase = "playing";
            session.roundMessage = "Find another pair.";
            if (!checkPlayerAlive(player)) return;
            setPickable(session, true);
        }, MISMATCH_SHOW_MS);
    }, SECOND_REVEAL_MS);
}

function finishMatch(
    session: MemorySession,
    first: MemorySlot,
    second: MemorySlot,
    token: number
): void {
    const pairsLeftBefore = memorySlotsRemaining(session.slots) / 2;
    session.roundMessage =
        pairsLeftBefore === 1
            ? "Match — last pair!"
            : `Match! ${pairsLeftBefore - 1} pairs left.`;

    scheduleAnimation(() => {
        if (!isAnimationActive(token)) return;

        first.matched = true;
        second.matched = true;

        scheduleAnimation(() => {
            if (!isAnimationActive(token)) return;
            session.firstPickId = null;
            session.phase = "playing";
            const player = activePlayer;
            if (player && !checkPlayerAlive(player)) return;
            if (memorySlotsRemaining(session.slots) === 0) {
                checkBoardCleared(session, token);
                return;
            }
            setPickable(session, true);
        }, MATCH_SHOW_MS);
    }, SECOND_REVEAL_MS);
}

function resolvePair(session: MemorySession, firstId: number, secondId: number): void {
    const token = memoryAnimationToken;
    const first = slotById(session, firstId);
    const second = slotById(session, secondId);
    if (!first || !second) return;

    if (memoryCardsMatch(first.card, second.card)) {
        finishMatch(session, first, second, token);
    } else {
        finishMismatch(session, first, second, token);
    }
}

function pickCard(slotId: number): void {
    const session = sessionRef.value;
    if (!session || !session.canPick || session.phase !== "playing") return;

    const slot = slotById(session, slotId);
    if (!slot || slot.matched || slot.card.revealed) return;

    if (session.firstPickId === null) {
        revealWithDealAnimation(slot.card);
        session.firstPickId = slotId;
        session.roundMessage = "Pick a second card.";
        return;
    }

    if (session.firstPickId === slotId) return;

    revealWithDealAnimation(slot.card);
    const firstId = session.firstPickId;
    session.phase = "resolving";
    setPickable(session, false);
    session.roundMessage = "Revealing…";
    resolvePair(session, firstId, slotId);
}

function beginMemoryPlay(): void {
    const session = sessionRef.value;
    if (!session || session.phase !== "intro") return;
    session.phase = "playing";
    session.canPick = true;
    session.roundMessage = "All cards are face down. Pick two to find a pair.";
}

export function useMemory(): {
    session: Ref<MemorySession | null>;
    startMemory: (player: Player, minigame: MemoryMinigame) => void;
    resetMemory: () => void;
    beginPlay: () => void;
    pickCard: (slotId: number) => void;
} {
    return {
        session: sessionRef,
        startMemory(player: Player, minigame: MemoryMinigame) {
            cancelMemoryAnimation();
            activePlayer = player;
            activeMinigame = minigame;

            sessionRef.value = {
                slots: buildMemoryBoard(player),
                phase: "intro",
                firstPickId: null,
                roundMessage:
                    "Eight pairs from your combat deck lie face down. Match them all to win.",
                canPick: false,
            };
        },
        beginPlay: beginMemoryPlay,
        resetMemory() {
            cancelMemoryAnimation();
            activePlayer = null;
            activeMinigame = null;
            sessionRef.value = null;
        },
        pickCard,
    };
}

export function startMemorySession(player: Player, minigame: MemoryMinigame): void {
    useMemory().startMemory(player, minigame);
}

export function resetMemorySession(): void {
    useMemory().resetMemory();
}
