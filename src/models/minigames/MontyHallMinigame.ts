import Minigame, { type MinigameOutcomeBranch } from "../Minigame";

export type MontyCardKind = "winner" | "loser";

const LOSER_DAMAGE_BASE = 10;

export function createMontyLayout(): MontyCardKind[] {
    const layout: MontyCardKind[] = ["loser", "loser", "loser"];
    layout[Math.floor(Math.random() * 3)] = "winner";
    return layout;
}

/** Monty reveals a losing door the player did not pick. */
export function pickDoorToReveal(
    initialPick: number,
    layout: readonly MontyCardKind[]
): number {
    const revealable = layout
        .map((kind, index) => ({ kind, index }))
        .filter(({ kind, index }) => index !== initialPick && kind === "loser")
        .map(({ index }) => index);
    if (revealable.length === 0) {
        throw new Error("Monty Hall: no losing door to reveal");
    }
    return revealable[Math.floor(Math.random() * revealable.length)]!;
}

/** The door the player may switch to (the one that is neither initial pick nor revealed). */
export function switchDoorIndex(initialPick: number, revealedIndex: number): number {
    const other = [0, 1, 2].find((i) => i !== initialPick && i !== revealedIndex);
    if (other === undefined) {
        throw new Error("Monty Hall: no door to switch to");
    }
    return other;
}

export default class MontyHallMinigame extends Minigame {
    readonly success: MinigameOutcomeBranch = {
        effect: () => {},
        message: "The goat host bows. You found the prize and may continue your journey.",
    };

    readonly failure: MinigameOutcomeBranch = {
        effect: (player, minigame) => {
            minigame.damagePlayer(player, LOSER_DAMAGE_BASE);
        },
        message: "",
    };

    constructor(act: number) {
        super({
            act,
            name: "The Goat's Dilemma",
            description:
                "A goat host invites you to pick one of three cards — one prize, two blanks — then offers a famous second chance.",
            options: [],
        });
    }

    loserDamage(): number {
        return this.damageForAct(LOSER_DAMAGE_BASE);
    }

    resolveFinal(finalIndex: number, layout: readonly MontyCardKind[]): MinigameOutcomeBranch {
        if (layout[finalIndex] === "winner") {
            return this.success;
        }
        const damage = this.loserDamage();
        return {
            effect: this.failure.effect,
            message: `The goat bleats in sympathy. Wrong card — you take ${damage} damage.`,
        };
    }
}
