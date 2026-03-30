import Enemy, { buildDeckFromCounts, createRandomActionGenerator } from "../Enemy";

export default class DwambatEnemy extends Enemy {
    constructor() {
        super({
            name: "Dwambat",
            health: 15,
            generateTurnActions: createRandomActionGenerator(() =>
                buildDeckFromCounts({
                    doNothing: 2,
                    weakAttack: 4,
                    block: 3,
                    summonRat: 2,
                    haste: 1,
                })
            ),
        });
    }
}
