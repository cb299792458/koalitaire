import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class GruntEnemy extends Enemy {
    constructor() {
        super({
            name: "Grunt",
            health: 20,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack"])
            ),
        });
    }
}
