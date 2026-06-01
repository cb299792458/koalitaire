import { ref, type Ref } from "vue";
import type Card from "../models/Card";
import { playDealAnimation } from "../game/minigameCardAnimation";
import { buildShuffledCombatDeck } from "../game/minigameDeck";
import {
    addCardsToPileBottom,
    buildOpponentWarDeck,
    compareWarCards,
    drawFromPileTop,
    warDamageOnLoss,
} from "../game/war";
import WarMinigame, { WAR_EMPTY_DECK_DAMAGE_BASE } from "../models/minigames/WarMinigame";
import type Player from "../models/Player";
import { publishMinigameResult } from "./minigameResult";

export type WarPhase =
    | "intro"
    | "battle-ready"
    | "flipping-opponent"
    | "comparing"
    | "skirmish-result"
    | "complete";

export interface WarSession {
    wins: number;
    winsRequired: number;
    phase: WarPhase;
    playerPile: Card[];
    opponentPile: Card[];
    playerCard: Card | null;
    opponentCard: Card | null;
    roundMessage: string;
    canFlip: boolean;
}

/** Delay before the foe flips after you do. */
const OPPONENT_FLIP_DELAY_MS = 550;
/** Pause with both cards visible before resolving. */
const COMPARE_DELAY_MS = 600;
/** Pause on skirmish result before the next battle starts. */
const SKIRMISH_RESULT_MS = 450;
/** Foe card sits face down in the play area before flipping. */
const OPPONENT_CARD_REVEAL_MS = 350;

const sessionRef = ref<WarSession | null>(null);
let warAnimationToken = 0;
let activePlayer: Player | null = null;
let activeMinigame: WarMinigame | null = null;
let skirmishPot: Card[] = [];
let animationTimer: ReturnType<typeof setTimeout> | null = null;
let campaignTimer: ReturnType<typeof setTimeout> | null = null;

function cancelWarAnimation(): void {
    warAnimationToken += 1;
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
    return warAnimationToken === token && sessionRef.value != null;
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

function buildPlayerPile(player: Player): Card[] {
    return buildShuffledCombatDeck(player, false);
}

function clearBattleCards(session: WarSession): void {
    session.playerCard = null;
    session.opponentCard = null;
}

function setInteractionFlags(session: WarSession): void {
    session.canFlip =
        session.phase === "battle-ready" &&
        session.playerPile.length > 0 &&
        (session.opponentPile.length > 0 || session.playerPile.length > 0);
}

function scheduleAfterSkirmishResult(session: WarSession): void {
    const token = warAnimationToken;
    scheduleCampaign(() => {
        if (!isAnimationActive(token)) return;
        const player = activePlayer;
        if (!player || session.phase !== "skirmish-result") return;
        if (checkCampaignEnd(session, player)) return;
        beginSkirmish(session);
    }, SKIRMISH_RESULT_MS);
}

function applySkirmishWin(session: WarSession, tied = false): void {
    addCardsToPileBottom(session.playerPile, skirmishPot);
    skirmishPot = [];
    session.wins += 1;
    session.phase = "skirmish-result";
    session.roundMessage = tied
        ? `Tie — you win the battle! (${session.wins}/${session.winsRequired})`
        : `You win the battle! (${session.wins}/${session.winsRequired})`;
    setInteractionFlags(session);
    const player = activePlayer;
    if (player && checkCampaignEnd(session, player)) return;
    scheduleAfterSkirmishResult(session);
}

function applySkirmishLoss(
    session: WarSession,
    player: Player,
    playerCard: Card,
    opponentCard: Card
): void {
    const minigame = activeMinigame;
    const damage = minigame
        ? minigame.damagePlayer(player, warDamageOnLoss(playerCard, opponentCard))
        : 0;
    addCardsToPileBottom(session.opponentPile, skirmishPot);
    skirmishPot = [];
    session.phase = "skirmish-result";
    session.roundMessage =
        damage > 0
            ? `You lose the battle and take ${damage} damage.`
            : "You lose the battle.";
    setInteractionFlags(session);
    if (checkCampaignEnd(session, player)) return;
    scheduleAfterSkirmishResult(session);
}

function completeMinigameSuccess(): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.roundMessage = "Three victories! You leave the battlefield.";
    session.canFlip = false;
    publishMinigameResult("You won three battles at War and march on.");
}

function completeMinigameDefeat(message: string): void {
    const session = sessionRef.value!;
    session.phase = "complete";
    session.roundMessage = message;
    session.canFlip = false;
    publishMinigameResult(message);
}

function handlePlayerDeckEmpty(session: WarSession, player: Player): void {
    addCardsToPileBottom(session.opponentPile, skirmishPot);
    skirmishPot = [];
    const minigame = activeMinigame;
    const damage =
        minigame && player.health > 0
            ? minigame.damagePlayer(player, WAR_EMPTY_DECK_DAMAGE_BASE)
            : 0;
    completeMinigameDefeat(
        player.health > 0
            ? `Your deck ran dry. You take ${damage} damage and retreat.`
            : "Your deck ran dry and you fall on the field."
    );
}

function checkCampaignEnd(session: WarSession, player: Player): boolean {
    if (player.health <= 0) {
        completeMinigameDefeat("You fall before reaching three victories.");
        return true;
    }
    if (session.wins >= session.winsRequired) {
        completeMinigameSuccess();
        return true;
    }
    return false;
}

function beginSkirmish(session: WarSession): void {
    clearBattleCards(session);
    skirmishPot = [];
    session.phase = "battle-ready";
    session.roundMessage = "Flip the top card of your deck.";
    setInteractionFlags(session);
}

function resolveComparison(session: WarSession, token: number): void {
    const player = activePlayer;
    if (!player || !isAnimationActive(token)) return;

    const playerCard = session.playerCard;
    const opponentCard = session.opponentCard;
    if (!playerCard || !opponentCard) return;

    const result = compareWarCards(playerCard, opponentCard);

    if (result === "player" || result === "tie") {
        applySkirmishWin(session, result === "tie");
    } else {
        applySkirmishLoss(session, player, playerCard, opponentCard);
    }
}

function revealOpponentCard(session: WarSession, token: number): void {
    if (!isAnimationActive(token) || session.phase !== "flipping-opponent") return;

    const opponentCard = session.opponentCard;
    if (!opponentCard) return;

    opponentCard.revealed = true;
    playDealAnimation(opponentCard);
    session.phase = "comparing";
    session.roundMessage = "Compare the cards…";

    scheduleAnimation(() => resolveComparison(session, token), COMPARE_DELAY_MS);
}

function flipOpponentCard(session: WarSession, token: number): void {
    if (!isAnimationActive(token) || session.phase !== "flipping-opponent") return;

    if (session.opponentPile.length === 0) {
        applySkirmishWin(session);
        if (activePlayer) {
            checkCampaignEnd(session, activePlayer);
        }
        return;
    }

    const opponentCard = drawFromPileTop(session.opponentPile, false);
    if (!opponentCard) {
        applySkirmishWin(session);
        return;
    }

    skirmishPot.push(opponentCard);
    session.opponentCard = opponentCard;
    session.roundMessage = "Opponent flips…";

    scheduleAnimation(() => revealOpponentCard(session, token), OPPONENT_CARD_REVEAL_MS);
}

function flipPlayerCard(): void {
    const session = sessionRef.value;
    const player = activePlayer;
    const token = warAnimationToken;
    if (!session || !player || !session.canFlip || session.phase !== "battle-ready") {
        return;
    }

    if (session.playerPile.length === 0) {
        handlePlayerDeckEmpty(session, player);
        return;
    }

    const playerCard = drawFromPileTop(session.playerPile);
    if (!playerCard) {
        handlePlayerDeckEmpty(session, player);
        return;
    }

    skirmishPot.push(playerCard);
    session.playerCard = playerCard;
    playDealAnimation(playerCard);
    session.canFlip = false;
    session.phase = "flipping-opponent";
    session.roundMessage = "Opponent flips…";

    scheduleAnimation(() => flipOpponentCard(session, token), OPPONENT_FLIP_DELAY_MS);
}

function beginWarPlay(): void {
    const session = sessionRef.value;
    if (!session || session.phase !== "intro") return;
    session.phase = "battle-ready";
    session.canFlip = true;
    session.roundMessage = "Both decks are shuffled. Flip your top card when ready.";
}

export function useWar(): {
    session: Ref<WarSession | null>;
    startWar: (player: Player, minigame: WarMinigame) => void;
    resetWar: () => void;
    beginPlay: () => void;
    flipPlayerCard: () => void;
} {
    return {
        session: sessionRef,
        startWar(player: Player, minigame: WarMinigame) {
            cancelWarAnimation();
            activePlayer = player;
            activeMinigame = minigame;
            skirmishPot = [];

            const playerPile = buildPlayerPile(player);
            const opponentPile = buildOpponentWarDeck(playerPile.length);

            sessionRef.value = {
                wins: 0,
                winsRequired: minigame.winsRequired,
                phase: "intro",
                playerPile,
                opponentPile,
                playerCard: null,
                opponentCard: null,
                roundMessage:
                    "Your shuffled deck faces a random foe deck. Win three battles to leave.",
                canFlip: false,
            };
        },
        beginPlay: beginWarPlay,
        resetWar() {
            cancelWarAnimation();
            activePlayer = null;
            activeMinigame = null;
            skirmishPot = [];
            sessionRef.value = null;
        },
        flipPlayerCard,
    };
}

export function startWarSession(player: Player, minigame: WarMinigame): void {
    useWar().startWar(player, minigame);
}

export function resetWarSession(): void {
    useWar().resetWar();
}
