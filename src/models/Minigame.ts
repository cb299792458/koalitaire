import type { EventOption } from "./Event";
import type Player from "./Player";

export type MinigameStat = EventOption["stat"];

export interface MinigameOption {
    stat: MinigameStat;
    description: string;
    success?: MinigameOutcomeBranch;
    failure?: MinigameOutcomeBranch;
}

export interface MinigameOutcomeBranch {
    effect: (player: Player, minigame: Minigame) => void;
    message: string;
}

export interface MinigameParams {
    act: number;
    name: string;
    description: string;
    options: MinigameOption[];
}

export default class Minigame {
    readonly act: number;
    readonly name: string;
    readonly description: string;
    readonly options: MinigameOption[];

    constructor(params: MinigameParams) {
        this.act = params.act;
        this.name = params.name;
        this.description = params.description;
        this.options = params.options;
    }

    /** Minigame penalty damage: base amount × act. */
    damageForAct(base: number): number {
        return Math.max(0, Math.round(base * this.act));
    }

    damagePlayer(player: Player, baseDamage: number): number {
        const amount = this.damageForAct(baseDamage);
        if (amount > 0) {
            player.takeDamage(amount);
        }
        return amount;
    }
}

export type MinigameConstructor = new (act: number) => Minigame;
