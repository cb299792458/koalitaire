import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class PlatypusEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Platypus",
            health: 10,
            tooltip: "A really weird looking animal.",
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack", "doNothing", "weakAttack", "haste"])
            ),
        });
    }
}
