import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class RangerEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Ranger",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakRangedAttack"])
            ),
        });
    }
}
