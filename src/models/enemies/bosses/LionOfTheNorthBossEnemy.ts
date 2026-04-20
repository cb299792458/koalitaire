import Enemy, { type EnemyTurnContext } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";
import { Race } from "../../Summon";
import { CombatStatusId } from "../../../game/combatStatuses";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const blindingBaldness = new EnemyAction(
    "Blinding Baldness",
    "The Lion's glare leaves you Knackered for 3 turns — you deal less damage to the enemy.",
    (_enemy, player) => {
        player.addCombatStatus(CombatStatusId.Knackered, 3);
    }
);

const bindingOfCords = new EnemyAction(
    "The Binding of Cords",
    "Cord and knot tighten around you: Crook for 3 turns — you take more damage from all sources.",
    (_enemy, player) => {
        player.addCombatStatus(CombatStatusId.Crook, 3);
    }
);

const eggShell = new EnemyAction(
    "Egg Shell",
    "The Lion curls behind a hardened shell — gains block equal to 5 plus its armor.",
    (enemy) => {
        enemy.gainBlock(5 + enemy.armor);
    }
);

const judoChop = buildAttackAction({
    name: "Judo Chop",
    damage: 5,
    description: "A sharp strike for 5 damage, plus the Lion's attack.",
});

function lionTurnActions(context: EnemyTurnContext) {
    if (context.turnNumber === 1) return [blindingBaldness];
    if (context.turnNumber === 2) return [bindingOfCords];
    const out: EnemyAction[] = [];
    for (let i = 0; i < context.actions; i++) {
        out.push(Math.random() < 0.5 ? eggShell : judoChop);
    }
    return out;
}

const retinueCompanionBase: Omit<SummonTemplate, "name"> = {
    description: "One of the Lion's actual feline sons.",
    tooltip: "Twin companions of the Lion of the North.",
    hp: 30,
    damage: 5,
    race: Race.Dingo,
};

export default class LionOfTheNorthBossEnemy extends Enemy {
    constructor() {
        super({
            name: "Lion of the North",
            health: 48,
            tooltip: "Boss — opens with Ryuka and Tomo at their side.",
            generateTurnActions: lionTurnActions,
            onCombatStart: (enemy) => {
                enemy.summons.push(
                    createSummon({
                        ...retinueCompanionBase,
                        name: "Ryuka",
                    })
                );
                enemy.summons.push(
                    createSummon({
                        ...retinueCompanionBase,
                        name: "Tomo",
                    })
                );
            },
        });
    }
}
