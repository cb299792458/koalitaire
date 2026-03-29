import Enemy, { buildDeckFromCounts } from "../Enemy";
import dingorcPortrait from "/player_portraits/dingorc.jpg";

export default class DingorcEnemy extends Enemy {
    constructor() {
        super({
            name: "Dingorc",
            portrait: dingorcPortrait,
            health: 35,
            makeDeck: () =>
                buildDeckFromCounts({
                    doNothing: 1,
                    weakAttack: 2,
                    strongAttack: 5,
                    block: 4,
                    buff: 3,
                    heal: 3,
                    summonRat: 2,
                    haste: 2,
                }),
        });
    }
}
