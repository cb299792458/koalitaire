import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class MageEnemy extends Enemy {
    constructor() {
        super({
            name: "Mage",
            health: 20,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakMagicAttack"])
            ),
        });
    }
}
