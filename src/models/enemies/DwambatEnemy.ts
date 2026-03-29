import Enemy, { buildDeckFromCounts } from "../Enemy";
import dwambatPortrait from "/player_portraits/dwambat.jpg";

export default class DwambatEnemy extends Enemy {
    constructor() {
        super({
            name: "Dwambat",
            portrait: dwambatPortrait,
            health: 15,
            makeDeck: () =>
                buildDeckFromCounts({
                    doNothing: 2,
                    weakAttack: 4,
                    block: 3,
                    summonRat: 2,
                    haste: 1,
                }),
        });
    }
}
