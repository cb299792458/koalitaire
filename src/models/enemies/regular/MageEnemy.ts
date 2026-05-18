import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class MageEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Mage",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakMagicAttack"])
            ),
        });
    }
}
