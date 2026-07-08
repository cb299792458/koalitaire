import Minigame, { type MinigameOutcomeBranch } from "../Minigame";

export type ShellCardKind = "rocko" | "heffer" | "filburt";

/** Face art under `public/events/` for each shell-game card. */
export const SHELL_CARD_ARTWORK: Record<ShellCardKind, string> = {
    rocko: "/events/Wallaby_Yes.jpg",
    heffer: "/events/Steer_No.jpg",
    filburt: "/events/Turtle_No.jpg",
};

/** Same paths keyed by spell display name (for {@link cardArtworkFallbackUrls}). */
export const SHELL_CARD_ARTWORK_BY_NAME: Record<string, string> = {
    Rocko: SHELL_CARD_ARTWORK.rocko,
    Heffer: SHELL_CARD_ARTWORK.heffer,
    Filburt: SHELL_CARD_ARTWORK.filburt,
};

const WRONG_PICK_DAMAGE_BASE = 10;

export function createShuffledShellLayout(): ShellCardKind[] {
    const layout: ShellCardKind[] = ["rocko", "heffer", "filburt"];
    for (let i = layout.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = layout[i]!;
        layout[i] = layout[j]!;
        layout[j] = tmp;
    }
    return layout;
}

export default class ShellGameMinigame extends Minigame {
    readonly success: MinigameOutcomeBranch = {
        effect: () => {},
        message: "You found Rocko! You win this round.",
    };

    readonly failure: MinigameOutcomeBranch = {
        effect: (player, minigame) => {
            minigame.damagePlayer(player, WRONG_PICK_DAMAGE_BASE);
        },
        message: "", // set in resolvePick so it can include act-scaled damage
    };

    constructor(act: number) {
        super({
            act,
            name: "Rocko's Shell Game",
            description:
                "Rocko the wallaby lays out three cards — himself, Heffer the steer, and Filburt the turtle — shuffles them, and dares you to find him.",
            options: [],
        });
    }

    wrongPickDamage(): number {
        return this.damageForAct(WRONG_PICK_DAMAGE_BASE);
    }

    resolvePick(slotIndex: number, layout: readonly ShellCardKind[]): MinigameOutcomeBranch {
        const picked = layout[slotIndex];
        if (picked === "rocko") {
            return this.success;
        }
        const damage = this.wrongPickDamage();
        if (picked === "heffer") {
            return {
                effect: this.failure.effect,
                message: `Heffer moos! You take ${damage} damage.`,
            };
        }
        return {
            effect: this.failure.effect,
            message: `Filburt ducks into his shell! You take ${damage} damage.`,
        };
    }
}
