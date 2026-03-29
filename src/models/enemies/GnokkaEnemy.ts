import Enemy, { buildDeckFromCounts } from "../Enemy";
import gnokkaPortrait from "/player_portraits/gnokka.jpg";

export default class GnokkaEnemy extends Enemy {
    constructor() {
        super({
            name: "Gnokka",
            portrait: gnokkaPortrait,
            health: 20,
            makeDeck: () =>
                buildDeckFromCounts({
                    doNothing: 2,
                    weakMagicAttack: 3,
                    strongMagicAttack: 3,
                    buff: 2,
                    summonRat: 2,
                    haste: 1,
                }),
        });
    }
}
