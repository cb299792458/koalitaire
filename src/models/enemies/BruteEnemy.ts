import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class BruteEnemy extends Enemy {
    constructor() {
        super({
            name: "Brute",
            health: 40,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack", "weakAttack"])
            ),
        });
    }
}
