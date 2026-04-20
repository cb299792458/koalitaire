import Enemy, { type EnemyTurnContext } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { Race } from "../../Summon";
import { CombatStatusId } from "../../../game/combatStatuses";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const storytellerTigerTemplate: SummonTemplate = {
    name: "Storyteller's Tiger",
    description: "A fierce cat leapt from the tale — claws, teeth, and terrible momentum.",
    tooltip: "A powerful ally of Anansi: heavy blows each enemy turn.",
    hp: 22,
    damage: 8,
    race: Race.Dingo,
};

const releaseTheTiger = new EnemyAction(
    "The tiger enters the tale",
    "Anansi plucks a thread and a great tiger pads forth from the story.",
    (enemy, _player, combat) => {
        enemy.summons.push(createSummon(storytellerTigerTemplate));
        combat.notify();
    }
);

const weaveBlock = new EnemyAction(
    "Weave a shield",
    "Anansi spins silk into a bulwark — gains block equal to 8 plus her armor.",
    (enemy, _player, combat) => {
        enemy.gainBlock(8 + enemy.armor);
        combat.notify();
    }
);

const venomOfTheTale = new EnemyAction(
    "Venom of the tale",
    "The story turns bitter — you are Poisoned for several turns.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Poisoned, 4);
        combat.notify();
    }
);

const enweb = new EnemyAction(
    "Enweb",
    "Silk and story bind you: Knackered and Crook for two turns each.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Knackered, 2);
        player.addCombatStatus(CombatStatusId.Crook, 2);
        combat.notify();
    }
);

function anansiTurnActions(context: EnemyTurnContext): EnemyAction[] {
    if (context.turnNumber === 1) {
        return [releaseTheTiger];
    }
    const roll = Math.random();
    if (roll < 1 / 3) {
        return [weaveBlock];
    }
    if (roll < 2 / 3) {
        return [venomOfTheTale];
    }
    return [enweb];
}

export default class AnansiTheStoryWeaverBossEnemy extends Enemy {
    constructor() {
        super({
            name: "Anansi the Story Weaver",
            health: 40,
            tooltip: "Boss — opens with a tiger from the story, then weaves block, venom, or binding silk.",
            generateTurnActions: anansiTurnActions,
        });
    }
}
