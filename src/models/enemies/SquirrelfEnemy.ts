import Enemy, { buildDeckFromCounts } from "../Enemy";
import squirrelfPortrait from "/player_portraits/squirrelf.jpg";

export default class SquirrelfEnemy extends Enemy {
    constructor() {
        super({
            name: "Squirrelf",
            portrait: squirrelfPortrait,
            health: 25,
            makeDeck: () =>
                buildDeckFromCounts({
                    weakRangedAttack: 3,
                    strongRangedAttack: 4,
                    block: 3,
                    buff: 2,
                    heal: 2,
                    summonRat: 2,
                    haste: 2,
                }),
        });
    }
}
