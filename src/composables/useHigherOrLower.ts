import { ref, type Ref } from "vue";
import type Card from "../models/Card";
import { shuffleInPlace } from "../game/blackjack";
import { buildShuffledCombatDeck } from "../game/minigameDeck";
import { revealWithDealAnimation } from "../game/minigameCardAnimation";
import {
    higherOrLowerGuessWins,
    higherOrLowerIsTie,
    type HigherOrLowerGuess,
} from "../game/higherOrLower";
import HigherOrLowerMinigame, {
    HIGHER_LOWER_EMPTY_DECK_DAMAGE_BASE,
    HIGHER_LOWER_LOSS_DAMAGE_BASE,
} from "../models/minigames/HigherOrLowerMinigame";
import type Player from "../models/Player";
import { publishMinigameResult } from "./minigameResult";

export type HigherOrLowerPhase =
    | "intro"
    | "guessing"
    | "revealing"
    | "round-result"
    | "complete";

export interface HigherOrLowerSession {
    wins: number;
    winsRequired: number;
    phase: HigherOrLowerPhase;
    shoe: Card[];
    discard: Card[];
    currentCard: Card | null;
    nextCard: Card | null;
    lastGuess: HigherOrLowerGuess | null;
    roundMessage: string;
    canGuess: boolean;
}

const REVEAL_DELAY_MS = 650;
const ROUND_RESULT_MS = 900;

const sessionRef = ref<HigherOrLowerSession | null>(null);
let animationToken = 0;
let activePlayer: Player | null = null;
let activeMinigame: HigherOrLowerMinigame | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;
let campaignTimer: ReturnType<typeof setTimeout> | null = null;

function cancelAnimation(): void {
    animationToken += 1;
    if (animationTimer != null) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    if (campaignTimer != null) {
        clearTimeout(campaignTimer);
        campaignTimer = null;
    }
}

function isAnimationActive(token: number): boolean {
    return animationToken === token && sessionRef.value != null;
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

function scheduleCampaign(fn: () => void, ms: number): void {
    if (campaignTimer != null) {
        clearTimeout(campaignTimer);
    }
    campaignTimer = setTimeout(() => {
        campaignTimer = null;
        fn();
    }, ms);
}

function buildShoe(player: Player): Card[] {
    return buildShuffledCombatDeck(player, false);
}

function reshuffleDiscardIntoShoe(session: HigherOrLowerSession): boolean {
    if (session.discard.length === 0) return false;
    session.shoe = shuffleInPlace(session.discard);
    session.discard = [];
    return session.shoe.length > 0;
}

function drawFromShoe(session: HigherOrLowerSession, reveal = true): Card | null {
    if (session.shoe.length === 0 && !reshuffleDiscardIntoShoe(session)) {
        return null;
    }
    const card = session.shoe.shift();
    if (!card) return null;
    if (reveal) {
        revealWithDealAnimation(card);
    } else {
        card.revealed = false;
    }
    return card;
}

function setGuessable(session: HigherOrLowerSession, canGuess: boolean): void {
    session.canGuess = canGuess && session.phase === "guessing";
}

function completeMinigameSuccess(): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.roundMessage = "Five correct calls! You leave the trial.";
    session.canGuess = false;
    publishMinigameResult("You won five rounds of Higher or Lower and move on.");
}

function completeMinigameDefeat(message: string): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.roundMessage = message;
    session.canGuess = false;
    publishMinigameResult(message);
}

function handleEmptyDeck(player: Player): void {
    const minigame = activeMinigame;
    const damage =
        minigame && player.health > 0
            ? minigame.damagePlayer(player, HIGHER_LOWER_EMPTY_DECK_DAMAGE_BASE)
            : 0;
    completeMinigameDefeat(
        player.health > 0
            ? `Your deck ran dry. You take ${damage} damage and retreat.`
            : "Your deck ran dry and you fall."
    );
}

function checkCampaignEnd(session: HigherOrLowerSession, player: Player): boolean {
    if (player.health <= 0) {
        completeMinigameDefeat("You fall before reaching five victories.");
        return true;
    }
    if (session.wins >= session.winsRequired) {
        completeMinigameSuccess();
        return true;
    }
    return false;
}

function advanceReference(session: HigherOrLowerSession): void {
    if (!session.nextCard) return;

    if (session.currentCard) {
        session.discard.push(session.currentCard);
    }
    session.currentCard = session.nextCard;
    session.nextCard = null;
}

function ensureCurrentCard(session: HigherOrLowerSession, player: Player): boolean {
    if (session.currentCard != null) return true;

    const card = drawFromShoe(session);
    if (!card) {
        handleEmptyDeck(player);
        return false;
    }
    session.currentCard = card;
    return true;
}

function beginRound(session: HigherOrLowerSession): void {
    session.nextCard = null;
    session.lastGuess = null;
    session.phase = "guessing";
    session.roundMessage = "Higher or lower than the card shown?";
    setGuessable(session, session.currentCard != null);
}

function scheduleAdvanceAfterResult(session: HigherOrLowerSession, token: number): void {
    scheduleCampaign(() => {
        if (!isAnimationActive(token) || sessionRef.value !== session) return;

        const player = activePlayer;
        if (!player) return;

        advanceReference(session);

        if (checkCampaignEnd(session, player)) return;

        if (!ensureCurrentCard(session, player)) return;

        beginRound(session);
    }, ROUND_RESULT_MS);
}

function applyRoundWin(
    session: HigherOrLowerSession,
    token: number,
    tied: boolean
): void {
    session.wins += 1;
    session.phase = "round-result";
    session.roundMessage = tied
        ? `Tie! Close Enough! (${session.wins}/${session.winsRequired})`
        : `Correct! (${session.wins}/${session.winsRequired})`;
    setGuessable(session, false);

    const player = activePlayer;
    if (player && checkCampaignEnd(session, player)) return;

    scheduleAdvanceAfterResult(session, token);
}

function applyRoundLoss(session: HigherOrLowerSession, player: Player, token: number): void {
    const minigame = activeMinigame;
    const damage = minigame
        ? minigame.damagePlayer(player, HIGHER_LOWER_LOSS_DAMAGE_BASE)
        : 0;

    session.phase = "round-result";
    session.roundMessage =
        damage > 0
            ? `Wrong — you take ${damage} damage.`
            : "Wrong guess.";
    setGuessable(session, false);

    if (checkCampaignEnd(session, player)) return;

    scheduleAdvanceAfterResult(session, token);
}

function resolveGuess(session: HigherOrLowerSession, guess: HigherOrLowerGuess): void {
    const token = animationToken;
    const player = activePlayer;
    const current = session.currentCard;
    if (!player || !current) return;

    session.lastGuess = guess;
    session.canGuess = false;
    session.phase = "revealing";
    session.roundMessage = "Revealing the next card…";

    const next = drawFromShoe(session);
    if (!next) {
        handleEmptyDeck(player);
        return;
    }

    session.nextCard = next;

    scheduleAnimation(() => {
        if (!isAnimationActive(token)) return;

        const won = higherOrLowerGuessWins(guess, current, next);
        if (won) {
            applyRoundWin(session, token, higherOrLowerIsTie(current, next));
        } else {
            applyRoundLoss(session, player, token);
        }
    }, REVEAL_DELAY_MS);
}

function guessHigherOrLower(guess: HigherOrLowerGuess): void {
    const session = sessionRef.value;
    if (!session || !session.canGuess || session.phase !== "guessing") return;
    resolveGuess(session, guess);
}

function beginHigherOrLowerPlay(): void {
    const session = sessionRef.value;
    const player = activePlayer;
    if (!session || session.phase !== "intro" || !player) return;

    if (!ensureCurrentCard(session, player)) return;

    beginRound(session);
}

export function useHigherOrLower(): {
    session: Ref<HigherOrLowerSession | null>;
    startHigherOrLower: (player: Player, minigame: HigherOrLowerMinigame) => void;
    resetHigherOrLower: () => void;
    beginPlay: () => void;
    guessHigher: () => void;
    guessLower: () => void;
} {
    return {
        session: sessionRef,
        startHigherOrLower(player: Player, minigame: HigherOrLowerMinigame) {
            cancelAnimation();
            activePlayer = player;
            activeMinigame = minigame;

            const shoe = buildShoe(player);

            sessionRef.value = {
                wins: 0,
                winsRequired: minigame.winsRequired,
                phase: "intro",
                shoe,
                discard: [],
                currentCard: null,
                nextCard: null,
                lastGuess: null,
                roundMessage:
                    "Guess higher or lower than the card shown. Ties count as a win. Win five rounds to leave.",
                canGuess: false,
            };

            if (shoe.length === 0) {
                handleEmptyDeck(player);
            }
        },
        beginPlay: beginHigherOrLowerPlay,
        resetHigherOrLower() {
            cancelAnimation();
            activePlayer = null;
            activeMinigame = null;
            sessionRef.value = null;
        },
        guessHigher: () => guessHigherOrLower("higher"),
        guessLower: () => guessHigherOrLower("lower"),
    };
}

export function startHigherOrLowerSession(
    player: Player,
    minigame: HigherOrLowerMinigame
): void {
    useHigherOrLower().startHigherOrLower(player, minigame);
}

export function resetHigherOrLowerSession(): void {
    useHigherOrLower().resetHigherOrLower();
}
