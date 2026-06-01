import Minigame from "../Minigame";

export const BLACKJACK_WINS_REQUIRED = 1;
export const BLACKJACK_LOSS_DAMAGE_BASE = 3;

export default class BlackjackMinigame extends Minigame {
    readonly winsRequired = BLACKJACK_WINS_REQUIRED;

    constructor(act: number) {
        super({
            act,
            name: "Blackjack",
            description:
                "Play blackjack with your combat deck against the dealer. Win one hand to leave; ties go to you. Each loss deals 3×act damage.",
            options: [],
        });
    }

}

export function isBlackjackMinigame(minigame: Minigame): minigame is BlackjackMinigame {
    return minigame instanceof BlackjackMinigame;
}
