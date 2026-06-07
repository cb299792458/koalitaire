/** Design reference: Marina (Marina and the Diamonds). */
import Enemy, { createSequentialActionGenerator } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";
import { CombatStatusId } from "../../../game/combatStatuses";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const HEARTBREAKER_DAMAGE = 8;
const DECRODED_TURNS = 2;
const POISON_STING_TURNS = 3;

const heartbreaker = buildAttackAction({
    name: "Heartbreaker",
    damage: HEARTBREAKER_DAMAGE,
    description: `Diamond, the Stingray breaks your heart for ${HEARTBREAKER_DAMAGE} damage, plus attack.`,
});

const youreVulnerable = new EnemyAction(
    "You're Vulnerable",
    "You're Vulnerable — you are Decroded. You are not a robot.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Decroded, DECRODED_TURNS);
        combat.notify();
    }
);

const poisonSting = new EnemyAction(
    "Poison Sting",
    `Diamond, the Stingray stings you — you are Poisoned for ${POISON_STING_TURNS} turns.`,
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Poisoned, POISON_STING_TURNS);
        combat.notify();
    }
);

const carolineTemplate: SummonTemplate = {
    name: "Caroline",
    description: "Caroline fights at Diamond's side from the opening note.",
    tooltip: "A loyal companion in the Primadonna's court.",
    hp: 7,
    damage: 3,
    race: Race.Salamander,
    effect: async (combat, summon) => {
        await combat.damagePlayer(summon.damage);
    },
};

export default class DiamondTheStingrayGuardianEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Diamond, the Stingray",
            health: 40,
            tooltip:
                "Guardian — opens with Caroline; cycles Heartbreaker, You're Vulnerable (Decroded: you are not a robot), and Poison Sting.",
            generateTurnActions: createSequentialActionGenerator(() => [
                heartbreaker,
                youreVulnerable,
                poisonSting,
            ]),
            onCombatStart: (enemy) => {
                const scaled = {
                    ...carolineTemplate,
                    hp: enemy.scaleHealth(carolineTemplate.hp),
                    damage: enemy.scaleDamage(carolineTemplate.damage),
                };
                enemy.summons.push(createSummon(scaled));
            },
        });
    }
}
