import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class BarrageEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Barrage",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack"])
            ),
        });
    }
}
