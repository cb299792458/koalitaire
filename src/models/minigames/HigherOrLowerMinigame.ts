import Minigame from "../Minigame";

export const HIGHER_LOWER_WINS_REQUIRED = 5;
export const HIGHER_LOWER_LOSS_DAMAGE_BASE = 3;
export const HIGHER_LOWER_EMPTY_DECK_DAMAGE_BASE = 10;

export default class HigherOrLowerMinigame extends Minigame {
    readonly winsRequired = HIGHER_LOWER_WINS_REQUIRED;

    constructor(act: number) {
        super({
            act,
            name: "Higher or Lower",
            description:
                "Guess whether the next card from your deck is higher or lower than the one showing. Ties count as a win. Win five rounds to leave; each wrong guess deals 3×act damage.",
            options: [],
        });
    }

}

export function isHigherOrLowerMinigame(
    minigame: Minigame
): minigame is HigherOrLowerMinigame {
    return minigame instanceof HigherOrLowerMinigame;
}
