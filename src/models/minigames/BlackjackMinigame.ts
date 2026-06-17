import Minigame from "../Minigame";

export const BLACKJACK_WINS_REQUIRED = 1;
export const BLACKJACK_LOSS_DAMAGE_BASE = 3;

/** Display name for the dealer/host in Rabbattoir's culling game. */
export const RABBATTOIR_NAME = "Rabbattoir";
export const RABBATTOIR_TITLE = "the Black Jackrabbit";

export default class BlackjackMinigame extends Minigame {
    readonly winsRequired = BLACKJACK_WINS_REQUIRED;

    constructor(act: number) {
        super({
            act,
            name: "Rabbattoir's Cull",
            description:
                "Face Rabbattoir, the Black Jackrabbit — exiled from the warren because when the rabbit population swells, it is his grim job to cull it. The count stops at 21; anything over loses. Win one hand to walk away; ties go to you. Each loss deals 3×act damage.",
            options: [],
        });
    }

}

export function isBlackjackMinigame(minigame: Minigame): minigame is BlackjackMinigame {
    return minigame instanceof BlackjackMinigame;
}
