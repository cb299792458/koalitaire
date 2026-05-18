import Enemy, { buildDeckFromCounts, createRandomActionGenerator } from "../../Enemy";

export default class DwambatEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Dwambat",
            health: 15,
            generateTurnActions: createRandomActionGenerator(() =>
                buildDeckFromCounts({
                    doNothing: 4,
                    weakAttack: 3,
                    block: 2,
                })
            ),
        });
    }
}
