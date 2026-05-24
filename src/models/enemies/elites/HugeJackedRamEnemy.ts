import Enemy, { createSequentialActionGenerator, enemyActionFromKey } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const SHEEP_NAMES = ["Sebastian", "Lily", "Mopple"] as const;

const sheepBase: Omit<SummonTemplate, "name"> = {
    description: "A loyal sheep from the Huge Jacked Ram's flock.",
    tooltip: "Baa-ttering ram-partners — same stats, same attitude.",
    hp: 8,
    damage: 4,
    race: Race.Sheep,
    effect: async (combat, summon) => {
        await combat.damagePlayer(summon.damage);
    },
};

const adamantiumHorns = buildAttackAction({
    name: "Adamantium Horns",
    damage: 12,
    description: "The Huge Jacked Ram gores you with adamantium horns for 12 damage, plus attack.",
});

const regenerativeHealingFactor = new EnemyAction(
    "Regenerative Healing Factor",
    "The Huge Jacked Ram knits wounds with obscene vitality — heals for half its missing health.",
    (enemy, _player, combat) => {
        const missing = enemy.maxHealth - enemy.health;
        if (missing > 0) {
            enemy.gainHealth(Math.floor(missing / 2));
        }
        combat.notify();
    }
);

export default class HugeJackedRamEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Huge Jacked Ram",
            health: 42,
            tooltip:
                "Elite — opens with Sebastian, Lily, and Mopple; cycles Adamantium Horns, block, and a heal for half missing health.",
            generateTurnActions: createSequentialActionGenerator(() => [
                adamantiumHorns,
                enemyActionFromKey("block"),
                regenerativeHealingFactor,
            ]),
            onCombatStart: (enemy) => {
                const scaled = {
                    ...sheepBase,
                    hp: enemy.scaleHealth(sheepBase.hp),
                    damage: enemy.scaleDamage(sheepBase.damage),
                };
                for (const name of SHEEP_NAMES) {
                    enemy.summons.push(createSummon({ ...scaled, name }));
                }
            },
        });
    }
}
