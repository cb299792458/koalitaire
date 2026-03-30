import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class PlatypusEnemy extends Enemy {
    constructor() {
        super({
            name: "Platypus",
            health: 10,
            tooltip: "A really weird looking animal.",
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack", "doNothing", "weakAttack", "haste"])
            ),
        });
    }
}
