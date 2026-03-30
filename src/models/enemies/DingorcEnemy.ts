import Enemy, { buildDeckFromCounts, createRandomActionGenerator } from "../Enemy";

export default class DingorcEnemy extends Enemy {
    constructor() {
        super({
            name: "Dingorc",
            health: 35,
            generateTurnActions: createRandomActionGenerator(() =>
                buildDeckFromCounts({
                    doNothing: 1,
                    weakAttack: 2,
                    strongAttack: 5,
                    block: 4,
                    buff: 3,
                    heal: 3,
                    summonRat: 2,
                    haste: 2,
                })
            ),
        });
    }
}
