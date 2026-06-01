import type { Component } from "vue";
import type Minigame from "../models/Minigame";
import BlackjackBoard from "../components/BlackjackBoard.vue";
import HigherOrLowerBoard from "../components/HigherOrLowerBoard.vue";
import MemoryBoard from "../components/MemoryBoard.vue";
import MontyHallBoard from "../components/MontyHallBoard.vue";
import RatscrewBoard from "../components/RatscrewBoard.vue";
import ShellGameBoard from "../components/ShellGameBoard.vue";
import WarBoard from "../components/WarBoard.vue";
import {
    isBlackjackMinigame,
    isHigherOrLowerMinigame,
    isMemoryMinigame,
    isMontyHallMinigame,
    isRatscrewMinigame,
    isShellGameMinigame,
    isWarMinigame,
} from "../models/minigames";

export interface MinigameBoardConfig {
    board: Component;
    /** Extra class on minigame-tableau-stack (e.g. `--war`). */
    stackModifier?: string;
    /** Show description panel above the board. */
    showDescription: boolean;
}

function config(
    board: Component,
    options: { stackModifier?: string; showDescription?: boolean } = {}
): MinigameBoardConfig {
    return {
        board,
        stackModifier: options.stackModifier,
        showDescription: options.showDescription ?? true,
    };
}

export function resolveMinigameBoard(minigame: Minigame | null): MinigameBoardConfig | null {
    if (!minigame) return null;
    if (isShellGameMinigame(minigame)) return config(ShellGameBoard);
    if (isBlackjackMinigame(minigame)) return config(BlackjackBoard, { stackModifier: "blackjack" });
    if (isMontyHallMinigame(minigame)) return config(MontyHallBoard, { showDescription: false });
    if (isWarMinigame(minigame)) return config(WarBoard, { stackModifier: "war" });
    if (isMemoryMinigame(minigame)) return config(MemoryBoard, { stackModifier: "memory" });
    if (isHigherOrLowerMinigame(minigame)) return config(HigherOrLowerBoard, { stackModifier: "hol" });
    if (isRatscrewMinigame(minigame)) {
        return config(RatscrewBoard, { stackModifier: "ratscrew", showDescription: false });
    }
    return null;
}

export function minigameHasCustomBoard(minigame: Minigame | null): boolean {
    return resolveMinigameBoard(minigame) != null;
}
