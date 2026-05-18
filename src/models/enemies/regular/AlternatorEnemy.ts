import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class AlternatorEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Alternator",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack", "block"])
            ),
        });
    }
}
