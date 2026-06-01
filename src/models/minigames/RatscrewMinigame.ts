import Minigame from "../Minigame";

export const RATSCREW_MISS_DAMAGE_BASE = 5;
export const RATSCREW_FALSE_SLAP_DAMAGE_BASE = 2;

/** Prefix for in-game crew banter (a gang of pirate rats, not a single host). */
export const RATSCREW_CREW_LABEL = "Pirate rats";

export default class RatscrewMinigame extends Minigame {
    constructor(act: number) {
        super({
            act,
            name: "Ratscrew Round",
            description:
                "A crew of pirate rats flips your deck one card at a time. Slap on doubles, sandwiches, and double sandwiches — each miss deals 5×act damage; a rash slap deals 2×act. Survive to the last card to win.",
            options: [],
        });
    }

}

export function isRatscrewMinigame(minigame: Minigame): minigame is RatscrewMinigame {
    return minigame instanceof RatscrewMinigame;
}
