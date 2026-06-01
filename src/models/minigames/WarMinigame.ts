import Minigame from "../Minigame";

export const WAR_WINS_REQUIRED = 3;
export const WAR_EMPTY_DECK_DAMAGE_BASE = 10;

export default class WarMinigame extends Minigame {
    readonly winsRequired = WAR_WINS_REQUIRED;

    constructor(act: number) {
        super({
            act,
            name: "War",
            description:
                "Your shuffled combat deck faces a random opposing deck. Win three battles to leave; each loss deals rank-difference damage × act.",
            options: [],
        });
    }

}

export function isWarMinigame(minigame: Minigame): minigame is WarMinigame {
    return minigame instanceof WarMinigame;
}
