import Minigame from "../Minigame";

export const BLACKJACK_WINS_REQUIRED = 3;
export const BLACKJACK_LOSS_DAMAGE_PER_ACT = 3;

export default class BlackjackMinigame extends Minigame {
    readonly winsRequired = BLACKJACK_WINS_REQUIRED;

    constructor(act: number) {
        super({
            act,
            name: "Blackjack",
            description:
                "Play blackjack with your combat deck against the dealer. Win three hands to leave; each loss deals 3 damage per act.",
            options: [],
        });
    }

    lossDamage(): number {
        return BLACKJACK_LOSS_DAMAGE_PER_ACT * this.act;
    }
}

export function isBlackjackMinigame(minigame: Minigame): minigame is BlackjackMinigame {
    return minigame instanceof BlackjackMinigame;
}
