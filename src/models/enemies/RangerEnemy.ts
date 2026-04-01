import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class RangerEnemy extends Enemy {
    constructor() {
        super({
            name: "Ranger",
            health: 20,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakRangedAttack"])
            ),
        });
    }
}
