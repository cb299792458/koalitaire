import Enemy, { buildDeckFromCounts, createRandomActionGenerator } from "../../Enemy";

export default class GnokkaEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Gnokka",
            health: 18,
            generateTurnActions: createRandomActionGenerator(() =>
                buildDeckFromCounts({
                    doNothing: 3,
                    weakMagicAttack: 4,
                    block: 2,
                })
            ),
        });
    }
}
