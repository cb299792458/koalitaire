import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";
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

export default class HugeJackedRamEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Huge Jacked Ram",
            health: 42,
            tooltip: "Elite — brings Sebastian, Lily, and Mopple to the fight from the opening bell.",
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack", "block"])
            ),
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
