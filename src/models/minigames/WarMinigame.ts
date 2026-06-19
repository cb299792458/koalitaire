import Minigame from "../Minigame";

export const WAR_WINS_REQUIRED = 3;
export const WAR_EMPTY_DECK_DAMAGE_BASE = 10;

export const CASSOWAR_NAME = "Cassowar";
export const PLAYER_CASSOWARY_LABEL = "Your cassowary";
export const RIVAL_CASSOWARY_LABEL = "Rival cassowary";

export default class WarMinigame extends Minigame {
    readonly winsRequired = WAR_WINS_REQUIRED;

    constructor(act: number) {
        super({
            act,
            name: CASSOWAR_NAME,
            description:
                "Two cassowaries clash — your shuffled combat deck against a rival's. Flip the top card each round; higher rank wins the clash. Ties go to you. Win three clashes to leave; each loss deals rank-difference × act damage. Run out of cards: 10×act damage.",
            options: [],
        });
    }

}
