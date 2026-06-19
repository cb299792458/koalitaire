import type { Component } from "vue";
import type Minigame from "../models/Minigame";
import type { MinigameConstructor } from "../models/Minigame";
import BlackjackBoard from "../components/BlackjackBoard.vue";
import HigherOrLowerBoard from "../components/HigherOrLowerBoard.vue";
import MemoryBoard from "../components/MemoryBoard.vue";
import MontyHallBoard from "../components/MontyHallBoard.vue";
import RatscrewBoard from "../components/RatscrewBoard.vue";
import ShellGameBoard from "../components/ShellGameBoard.vue";
import WarBoard from "../components/WarBoard.vue";
import BlackjackMinigame from "../models/minigames/BlackjackMinigame";
import HigherOrLowerMinigame from "../models/minigames/HigherOrLowerMinigame";
import MemoryMinigame from "../models/minigames/MemoryMinigame";
import MontyHallMinigame from "../models/minigames/MontyHallMinigame";
import RatscrewMinigame from "../models/minigames/RatscrewMinigame";
import ShellGameMinigame from "../models/minigames/ShellGameMinigame";
import WarMinigame from "../models/minigames/WarMinigame";

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

const BOARD_BY_MINIGAME_CLASS = new Map<MinigameConstructor, MinigameBoardConfig>([
    [ShellGameMinigame, config(ShellGameBoard)],
    [BlackjackMinigame, config(BlackjackBoard, { stackModifier: "blackjack" })],
    [MontyHallMinigame, config(MontyHallBoard, { showDescription: false })],
    [WarMinigame, config(WarBoard, { stackModifier: "war" })],
    [MemoryMinigame, config(MemoryBoard, { stackModifier: "memory" })],
    [HigherOrLowerMinigame, config(HigherOrLowerBoard, { stackModifier: "hol" })],
    [RatscrewMinigame, config(RatscrewBoard, { stackModifier: "ratscrew", showDescription: false })],
]);

export function resolveMinigameBoard(minigame: Minigame | null): MinigameBoardConfig | null {
    if (!minigame) return null;
    return BOARD_BY_MINIGAME_CLASS.get(minigame.constructor as MinigameConstructor) ?? null;
}

export function minigameHasCustomBoard(minigame: Minigame | null): boolean {
    return resolveMinigameBoard(minigame) != null;
}
