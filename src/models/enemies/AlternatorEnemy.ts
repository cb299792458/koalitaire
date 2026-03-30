import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class AlternatorEnemy extends Enemy {
    constructor() {
        super({
            name: "Alternator",
            health: 20,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack", "block"])
            ),
        });
    }
}
