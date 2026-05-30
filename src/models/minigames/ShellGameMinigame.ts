import Minigame, { type MinigameOutcomeBranch } from "../Minigame";

export type ShellCardKind = "queen" | "jester";

const JESTER_DAMAGE_PER_ACT = 10;

export function createShuffledShellLayout(): ShellCardKind[] {
    const layout: ShellCardKind[] = ["jester", "jester", "jester"];
    layout[Math.floor(Math.random() * 3)] = "queen";
    return layout;
}

export default class ShellGameMinigame extends Minigame {
    readonly success: MinigameOutcomeBranch = {
        effect: () => {},
        message: "You found the Queen! You win this round.",
    };

    readonly failure: MinigameOutcomeBranch = {
        effect: (player, minigame) => {
            const damage = JESTER_DAMAGE_PER_ACT * minigame.act;
            if (damage > 0) {
                player.takeDamage(damage);
            }
        },
        message: "", // set in resolvePick so it can include act-scaled damage
    };

    constructor(act: number) {
        super({
            act,
            name: "Shell Game",
            description:
                "A shady operator flips three cards — one Queen, two Jesters — shuffles them, and dares you to pick.",
            options: [],
        });
    }

    jesterDamage(): number {
        return JESTER_DAMAGE_PER_ACT * this.act;
    }

    resolvePick(slotIndex: number, layout: readonly ShellCardKind[]): MinigameOutcomeBranch {
        if (layout[slotIndex] === "queen") {
            return this.success;
        }
        return {
            effect: this.failure.effect,
            message: `A Jester cackles! You take ${this.jesterDamage()} damage.`,
        };
    }
}

export function isShellGameMinigame(minigame: Minigame): minigame is ShellGameMinigame {
    return minigame instanceof ShellGameMinigame;
}
