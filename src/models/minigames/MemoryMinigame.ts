import Minigame from "../Minigame";

export const MEMORY_MISMATCH_DAMAGE_BASE = 1;

export default class MemoryMinigame extends Minigame {
    constructor(act: number) {
        super({
            act,
            name: "Memory",
            description:
                "Eight pairs from your combat deck lie face down. Match two at a time; each miss deals 1×act damage. Clear the board to win.",
            options: [],
        });
    }

    mismatchDamage(): number {
        return this.damageForAct(MEMORY_MISMATCH_DAMAGE_BASE);
    }
}

export function isMemoryMinigame(minigame: Minigame): minigame is MemoryMinigame {
    return minigame instanceof MemoryMinigame;
}
