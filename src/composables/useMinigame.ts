import { ref, type Ref } from "vue";
import type Minigame from "../models/Minigame";
import type { MinigameOption } from "../models/Minigame";
import ShellGameMinigame, {
    type ShellCardKind,
} from "../models/minigames/ShellGameMinigame";
import MontyHallMinigame, { type MontyCardKind } from "../models/minigames/MontyHallMinigame";
import type Player from "../models/Player";
import { playSound } from "../utils/sounds";
import {
    resetAllMinigameSessions,
    startMinigameSession,
} from "./minigameSessions";

const playerRef = ref<Player | null>(null);
const currentMinigameRef = ref<Minigame | null>(null);
const isInMinigameRef = ref(false);
const lastPlayerRollRef = ref<number | null>(null);
const lastMinigameRollRef = ref<number | null>(null);
const lastStatBonusRef = ref<number | null>(null);
const lastStatRef = ref<string | null>(null);
const resultMessageRef = ref<string | null>(null);
const isResolvingRef = ref(false);

let onLeaveMinigameCallback: (() => void) | undefined;

function rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
}

function getPlayerStat(player: Player, stat: MinigameOption["stat"]): number {
    if (!stat) return 0;
    const key = stat as keyof Player;
    const val = player[key];
    return typeof val === "number" ? val : 0;
}

function clearRollRefs(): void {
    lastPlayerRollRef.value = null;
    lastMinigameRollRef.value = null;
    lastStatBonusRef.value = null;
    lastStatRef.value = null;
}

export function useMinigame(): {
    player: Ref<Player | null>;
    currentMinigame: Ref<Minigame | null>;
    isInMinigame: Ref<boolean>;
    lastPlayerRoll: Ref<number | null>;
    lastMinigameRoll: Ref<number | null>;
    lastStatBonus: Ref<number | null>;
    lastStat: Ref<string | null>;
    resultMessage: Ref<string | null>;
    isResolving: Ref<boolean>;
    resetMinigameState: () => void;
    resolveChoice: (option: MinigameOption) => void;
    resolveShellGamePick: (slotIndex: number, layout: readonly ShellCardKind[]) => void;
    resolveMontyHallFinal: (finalIndex: number, layout: readonly MontyCardKind[]) => void;
    onMinigameContinue: () => void;
    choiceLabel: (option: MinigameOption) => string;
    enterMinigame: (player: Player, minigame: Minigame) => void;
    leaveMinigame: () => void;
    onLeaveMinigame: (fn: () => void) => void;
} {
    return {
        player: playerRef as Ref<Player | null>,
        currentMinigame: currentMinigameRef,
        isInMinigame: isInMinigameRef,
        lastPlayerRoll: lastPlayerRollRef,
        lastMinigameRoll: lastMinigameRollRef,
        lastStatBonus: lastStatBonusRef,
        lastStat: lastStatRef,
        resultMessage: resultMessageRef,
        isResolving: isResolvingRef,
        resetMinigameState() {
            resetAllMinigameSessions();
            isInMinigameRef.value = false;
            currentMinigameRef.value = null;
            playerRef.value = null;
            clearRollRefs();
            resultMessageRef.value = null;
            isResolvingRef.value = false;
        },
        resolveChoice(option: MinigameOption) {
            const p = playerRef.value;
            const minigame = currentMinigameRef.value;
            if (!p || !minigame || isResolvingRef.value) return;

            isResolvingRef.value = true;
            resultMessageRef.value = null;

            const hasSuccess = !!option.success;
            const hasFailure = !!option.failure;

            let outcome: { effect: (player: Player, minigame: Minigame) => void; message: string } | null =
                null;

            if (hasSuccess && !hasFailure) {
                outcome = option.success!;
            } else if (hasFailure && !hasSuccess) {
                outcome = option.failure!;
            } else if (hasSuccess && hasFailure) {
                playSound("dice", "mp3");
                const playerRoll = rollD20();
                const minigameRoll = rollD20();
                const statBonus = option.stat ? getPlayerStat(p as Player, option.stat) : 0;
                const playerTotal = playerRoll + statBonus;

                lastPlayerRollRef.value = playerRoll;
                lastMinigameRollRef.value = minigameRoll;
                lastStatBonusRef.value = option.stat ? statBonus : null;
                lastStatRef.value = option.stat || null;

                outcome = playerTotal > minigameRoll ? option.success! : option.failure!;
            }

            if (outcome) {
                outcome.effect(p as Player, minigame);
                resultMessageRef.value = outcome.message;
            }
            isResolvingRef.value = false;
        },
        resolveShellGamePick(slotIndex: number, layout: readonly ShellCardKind[]) {
            const p = playerRef.value;
            const minigame = currentMinigameRef.value;
            if (!p || !(minigame instanceof ShellGameMinigame) || isResolvingRef.value) return;

            isResolvingRef.value = true;
            const outcome = minigame.resolvePick(slotIndex, layout);
            outcome.effect(p as Player, minigame);
            resultMessageRef.value = outcome.message;
            isResolvingRef.value = false;
        },
        resolveMontyHallFinal(finalIndex: number, layout: readonly MontyCardKind[]) {
            const p = playerRef.value;
            const minigame = currentMinigameRef.value;
            if (!p || !(minigame instanceof MontyHallMinigame) || isResolvingRef.value) return;

            isResolvingRef.value = true;
            const outcome = minigame.resolveFinal(finalIndex, layout);
            outcome.effect(p as Player, minigame);
            resultMessageRef.value = outcome.message;
            isResolvingRef.value = false;
        },
        onMinigameContinue() {
            this.leaveMinigame();
        },
        choiceLabel(option: MinigameOption) {
            return option.stat ? `${option.description} (${option.stat})` : option.description;
        },
        enterMinigame(player: Player, minigame: Minigame) {
            playerRef.value = player;
            currentMinigameRef.value = minigame;
            isInMinigameRef.value = true;
            resultMessageRef.value = null;
            isResolvingRef.value = false;
            clearRollRefs();
            startMinigameSession(player, minigame);
        },
        leaveMinigame() {
            resetAllMinigameSessions();
            resultMessageRef.value = null;
            isResolvingRef.value = false;
            isInMinigameRef.value = false;
            currentMinigameRef.value = null;
            clearRollRefs();
            onLeaveMinigameCallback?.();
        },
        onLeaveMinigame(fn: () => void) {
            onLeaveMinigameCallback = fn;
        },
    };
}
