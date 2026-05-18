import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class GruntEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Grunt",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack"])
            ),
        });
    }
}
