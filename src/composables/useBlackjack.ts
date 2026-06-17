import { ref, type Ref } from "vue";
import type Card from "../models/Card";
import {
    compareHands,
    createDealerCard,
    dealerShouldHit,
    handTotal,
    isBust,
    shuffleInPlace,
    type BlackjackRoundResult,
} from "../game/blackjack";
import { buildShuffledCombatDeck } from "../game/minigameDeck";
import { revealWithDealAnimation } from "../game/minigameCardAnimation";
import BlackjackMinigame, {
    BLACKJACK_LOSS_DAMAGE_BASE,
    RABBATTOIR_NAME,
    RABBATTOIR_TITLE,
} from "../models/minigames/BlackjackMinigame";
import type Player from "../models/Player";
import { publishMinigameResult } from "./minigameResult";
import { useMinigame } from "./useMinigame";

export type BlackjackPhase =
    | "intro"
    | "player"
    | "dealer"
    | "round-result"
    | "complete";

export interface BlackjackSession {
    wins: number;
    winsRequired: number;
    phase: BlackjackPhase;
    playerHand: Card[];
    dealerHand: Card[];
    shoe: Card[];
    discard: Card[];
    dealerHoleHidden: boolean;
    roundMessage: string;
    canHit: boolean;
    canStay: boolean;
}

/** Pause before flipping the dealer's hole card. */
const DEALER_HOLE_REVEAL_MS = 650;
/** Pause between each dealer hit card. */
const DEALER_HIT_STEP_MS = 750;
/** Pause after dealer finishes, before showing win/loss/tie. */
const DEALER_BEFORE_RESULT_MS = 900;
/** How long the round result stays visible before the next hand. */
const ROUND_RESULT_MS = 2800;

const sessionRef = ref<BlackjackSession | null>(null);
let roundAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
let dealerAnimationToken = 0;
/** Dealer uses synthetic cards; never recycle these into the player's shoe. */
const dealerOnlyCards = new WeakSet<Card>();

function clearRoundTimer() {
    if (roundAdvanceTimer != null) {
        clearTimeout(roundAdvanceTimer);
        roundAdvanceTimer = null;
    }
}

function cancelDealerAnimation(): void {
    dealerAnimationToken += 1;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAnimationActive(token: number): boolean {
    return dealerAnimationToken === token && sessionRef.value != null;
}

function revealCard(card: Card): void {
    revealWithDealAnimation(card);
}

/** Snapshot of the combat deck once per minigame (getCombatDeck() returns new instances each call). */
function buildPlayerShoe(player: Player): Card[] {
    return buildShuffledCombatDeck(player, false);
}

function reshufflePlayerDiscardIntoShoe(session: BlackjackSession): void {
    const playerCards = session.discard.filter((card) => !dealerOnlyCards.has(card));
    session.discard.length = 0;
    if (playerCards.length === 0) return;
    session.shoe = shuffleInPlace(playerCards);
}

function drawFromShoe(session: BlackjackSession): Card | null {
    if (session.shoe.length === 0) {
        if (session.discard.length === 0) return null;
        reshufflePlayerDiscardIntoShoe(session);
        if (session.shoe.length === 0) return null;
    }
    const card = session.shoe.pop();
    if (!card) return null;
    revealCard(card);
    return card;
}

function drawDealerCard(session: BlackjackSession, hidden = false): Card {
    const card = createDealerCard();
    dealerOnlyCards.add(card);
    if (hidden) {
        card.revealed = false;
    }
    session.dealerHand.push(card);
    return card;
}

function discardHands(session: BlackjackSession): void {
    session.discard.push(...session.playerHand);
    session.playerHand = [];
    session.dealerHand = [];
}

function updatePlayerControls(session: BlackjackSession): void {
    const playing =
        session.phase === "player" &&
        session.wins < session.winsRequired &&
        !isBust(session.playerHand);
    session.canHit = playing;
    session.canStay = playing;
}

function dealOpeningCards(session: BlackjackSession): void {
    const p1 = drawFromShoe(session);
    const p2 = drawFromShoe(session);
    if (p1) session.playerHand.push(p1);
    if (p2) session.playerHand.push(p2);
    drawDealerCard(session);
    drawDealerCard(session, true);
}

function startRound(session: BlackjackSession): void {
    session.phase = "player";
    session.roundMessage = "Your turn — hit or stay.";
    session.dealerHoleHidden = true;
    dealOpeningCards(session);
    updatePlayerControls(session);

    if (isBust(session.playerHand)) {
        void concludeHandWithReveal(session, "dealer-win", "Over 21 — Rabbattoir culls you from this hand.");
    }
}

function revealDealerHoleCard(session: BlackjackSession): void {
    session.dealerHoleHidden = false;
    const hole = session.dealerHand[1];
    if (hole) {
        revealCard(hole);
    }
}

function revealAllDealerCards(session: BlackjackSession): void {
    session.dealerHoleHidden = false;
    for (const card of session.dealerHand) {
        revealCard(card);
    }
}

async function pauseForDealerReveal(session: BlackjackSession, token: number): Promise<boolean> {
    if (!session.dealerHoleHidden) {
        return isAnimationActive(token);
    }
    session.phase = "dealer";
    session.canHit = false;
    session.canStay = false;
    session.roundMessage = `${RABBATTOIR_NAME} reveals…`;
    await sleep(DEALER_HOLE_REVEAL_MS);
    if (!isAnimationActive(token) || sessionRef.value !== session) return false;
    revealDealerHoleCard(session);
    await sleep(DEALER_HIT_STEP_MS);
    return isAnimationActive(token) && sessionRef.value === session;
}

async function runDealerTurn(session: BlackjackSession): Promise<void> {
    const token = dealerAnimationToken;
    session.phase = "dealer";
    session.canHit = false;
    session.canStay = false;

    const revealed = await pauseForDealerReveal(session, token);
    if (!revealed) return;

    while (dealerShouldHit(session.dealerHand)) {
        session.roundMessage = `${RABBATTOIR_NAME} draws… (${handTotal(session.dealerHand)})`;
        await sleep(DEALER_HIT_STEP_MS);
        if (!isAnimationActive(token) || sessionRef.value !== session) return;

        drawDealerCard(session);
        if (isBust(session.dealerHand)) {
            session.roundMessage = `${RABBATTOIR_NAME} overshoots 21 at ${handTotal(session.dealerHand)}!`;
            await sleep(DEALER_BEFORE_RESULT_MS);
            if (!isAnimationActive(token) || sessionRef.value !== session) return;
            finishRound(session, "player-win", `${RABBATTOIR_NAME} busts! You win this hand.`);
            return;
        }
    }

    session.roundMessage = `${RABBATTOIR_NAME} holds at ${handTotal(session.dealerHand)}.`;
    await sleep(DEALER_BEFORE_RESULT_MS);
    if (!isAnimationActive(token) || sessionRef.value !== session) return;

    const outcome = compareHands(session.playerHand, session.dealerHand);
    if (outcome === "player-win") {
        finishRound(session, "player-win", "You win this hand!");
    } else if (outcome === "dealer-win") {
        finishRound(session, "dealer-win", `${RABBATTOIR_NAME} wins this cull.`);
    } else {
        finishRound(session, "player-win", "Tie — you win this hand.");
    }
}

/** Reveal dealer hole (if needed), pause, then resolve — used on player bust. */
async function concludeHandWithReveal(
    session: BlackjackSession,
    result: BlackjackRoundResult,
    message: string
): Promise<void> {
    const token = dealerAnimationToken;
    session.canHit = false;
    session.canStay = false;

    const ok = await pauseForDealerReveal(session, token);
    if (!ok) return;

    await sleep(DEALER_BEFORE_RESULT_MS);
    if (!isAnimationActive(token) || sessionRef.value !== session) return;

    finishRound(session, result, message);
}

function applyRoundOutcome(
    session: BlackjackSession,
    minigame: BlackjackMinigame,
    player: Player,
    result: BlackjackRoundResult
): string {
    if (result === "player-win") {
        session.wins += 1;
        return session.roundMessage;
    }
    if (result === "dealer-win") {
        const damage = minigame.damagePlayer(player, BLACKJACK_LOSS_DAMAGE_BASE);
        return `${session.roundMessage} You take ${damage} damage.`;
    }
    return session.roundMessage;
}

function completeMinigame(): void {
    sessionRef.value = {
        ...sessionRef.value!,
        phase: "complete",
        canHit: false,
        canStay: false,
        roundMessage: "You survived Rabbattoir's cull!",
    };
    publishMinigameResult("You beat Rabbattoir at 21 and slip away from the cull.");
}

function scheduleNextRound(session: BlackjackSession, minigame: BlackjackMinigame): void {
    clearRoundTimer();
    roundAdvanceTimer = setTimeout(() => {
        roundAdvanceTimer = null;
        if (!sessionRef.value || sessionRef.value !== session) return;
        if (session.wins >= minigame.winsRequired) {
            completeMinigame();
            return;
        }
        discardHands(session);
        startRound(session);
    }, ROUND_RESULT_MS);
}

function finishRound(
    session: BlackjackSession,
    result: BlackjackRoundResult,
    message: string
): void {
    session.phase = "round-result";
    session.canHit = false;
    session.canStay = false;
    revealAllDealerCards(session);

    const minigameState = useMinigame();
    const player = minigameState.player.value;
    const minigame = minigameState.currentMinigame.value;
    if (!player || !(minigame instanceof BlackjackMinigame)) return;

    session.roundMessage = message;
    session.roundMessage = applyRoundOutcome(session, minigame, player, result);

    if (session.wins >= minigame.winsRequired) {
        completeMinigame();
        return;
    }

    scheduleNextRound(session, minigame);
}

function beginBlackjackPlay(): void {
    const session = sessionRef.value;
    if (!session || session.phase !== "intro") return;
    startRound(session);
}

export function useBlackjack(): {
    session: Ref<BlackjackSession | null>;
    startBlackjack: (player: Player, minigame: BlackjackMinigame) => void;
    resetBlackjack: () => void;
    beginPlay: () => void;
    hit: () => void;
    stay: () => void;
} {
    return {
        session: sessionRef,
        startBlackjack(player: Player, minigame: BlackjackMinigame) {
            cancelDealerAnimation();
            clearRoundTimer();
            const shoe = buildPlayerShoe(player);
            sessionRef.value = {
                wins: 0,
                winsRequired: minigame.winsRequired,
                phase: "intro",
                playerHand: [],
                dealerHand: [],
                shoe,
                discard: [],
                dealerHoleHidden: true,
                roundMessage:
                    `Face ${RABBATTOIR_NAME}, ${RABBATTOIR_TITLE}. Win one hand to leave; ties go to you.`,
                canHit: false,
                canStay: false,
            };
        },
        beginPlay: beginBlackjackPlay,
        resetBlackjack() {
            cancelDealerAnimation();
            clearRoundTimer();
            sessionRef.value = null;
        },
        hit() {
            const session = sessionRef.value;
            if (!session || !session.canHit) return;

            const card = drawFromShoe(session);
            if (card) {
                session.playerHand.push(card);
            }

            if (isBust(session.playerHand)) {
                session.canHit = false;
                session.canStay = false;
                void concludeHandWithReveal(session, "dealer-win", "Over 21 — Rabbattoir culls you from this hand.");
                return;
            }

            session.roundMessage = `Your total: ${handTotal(session.playerHand)}. Hit or stay?`;
            updatePlayerControls(session);
        },
        stay() {
            const session = sessionRef.value;
            if (!session || !session.canStay) return;
            session.canHit = false;
            session.canStay = false;
            void runDealerTurn(session);
        },
    };
}

export function startBlackjackSession(player: Player, minigame: BlackjackMinigame): void {
    useBlackjack().startBlackjack(player, minigame);
}

export function resetBlackjackSession(): void {
    useBlackjack().resetBlackjack();
}
