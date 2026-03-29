import Enemy, { buildDeckFromPattern, pickSequentialActions } from "../Enemy";
import platypusPortrait from "/enemy_portraits/platypus.png";

export default class PlatypusEnemy extends Enemy {
    constructor() {
        super({
            name: "Platypus",
            portrait: platypusPortrait,
            health: 10,
            tooltip: "A really weird looking animal.",
            pickActions: pickSequentialActions,
            makeDeck: () =>
                buildDeckFromPattern(["weakAttack", "doNothing", "weakAttack", "haste"]),
        });
    }
}
