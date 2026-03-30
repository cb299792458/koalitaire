import Enemy, { buildDeckFromCounts, createRandomActionGenerator } from "../Enemy";

export default class GnokkaEnemy extends Enemy {
    constructor() {
        super({
            name: "Gnokka",
            health: 20,
            generateTurnActions: createRandomActionGenerator(() =>
                buildDeckFromCounts({
                    doNothing: 2,
                    weakMagicAttack: 3,
                    strongMagicAttack: 3,
                    buff: 2,
                    summonRat: 2,
                    haste: 1,
                })
            ),
        });
    }
}
