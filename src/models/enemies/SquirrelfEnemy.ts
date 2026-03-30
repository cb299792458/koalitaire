import Enemy, { buildDeckFromCounts, createRandomActionGenerator } from "../Enemy";

export default class SquirrelfEnemy extends Enemy {
    constructor() {
        super({
            name: "Squirrelf",
            health: 25,
            generateTurnActions: createRandomActionGenerator(() =>
                buildDeckFromCounts({
                    weakRangedAttack: 3,
                    strongRangedAttack: 4,
                    block: 3,
                    buff: 2,
                    heal: 2,
                    summonRat: 2,
                    haste: 2,
                })
            ),
        });
    }
}
