import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";
import { Race } from "../../Summon";
import { CombatStatusId } from "../../../game/combatStatuses";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const skipperTemplate: SummonTemplate = {
    name: "Skipper",
    description: "Keeps Captain Pingu and the squad in fighting shape.",
    tooltip: "Each turn: heals the Captain and all Penguinyu summons.",
    hp: 10,
    damage: 0,
    race: Race.Platypus,
    effect: (combat) => {
        const captain = combat.enemy;
        if (!captain) return;
        captain.gainHealth(captain.scaleHealth(5));
        const healAmount = captain.scaleStat(4);
        const maxHp = captain.scaleHealth(10);
        for (const s of captain.summons) {
            s.hp = Math.min(s.hp + healAmount, maxHp);
        }
    },
};

const ricoTemplate: SummonTemplate = {
    name: "Rico",
    description: "Lobs a smoke bomb — thick cover lets Captain Pingu slip the next hit.",
    tooltip: "Each turn: smoke out! Captain Pingu gains 1 dodge.",
    hp: 10,
    damage: 0,
    race: Race.Platypus,
    effect: (combat) => {
        const captain = combat.enemy;
        if (!captain) return;
        captain.dodge += 1;
    },
};

const kowalskiTemplate: SummonTemplate = {
    name: "Kowalski",
    description: "Analysis: debuff the opposition.",
    tooltip: "Each turn: applies 1 Knackered and 1 Decroded to you.",
    hp: 10,
    damage: 0,
    race: Race.Platypus,
    effect: (combat) => {
        const player = combat.player;
        if (!player) return;
        player.addCombatStatus(CombatStatusId.Knackered, 1);
        player.addCombatStatus(CombatStatusId.Decroded, 1);
    },
};

const privateTemplate: SummonTemplate = {
    name: "Private",
    description: "Cute, round, and surprisingly sturdy cover.",
    tooltip: "Each turn: Captain Pingu gains 5 block.",
    hp: 10,
    damage: 0,
    race: Race.Platypus,
    effect: (combat) => {
        const captain = combat.enemy;
        if (!captain) return;
        captain.gainBlock(captain.scaleDamage(5));
    },
};

export default class PenguinyuForceChampionEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Penguinyu Force",
            health: 44,
            tooltip: "Captain Pingu — Skipper, Rico, Kowalski, and Private back him up.",
            generateTurnActions: createSequentialActionGenerator(() => buildDeckFromPattern(["weakAttack"])),
            onCombatStart: (enemy) => {
                const scale = (t: typeof skipperTemplate) => ({
                    ...t,
                    hp: enemy.scaleHealth(t.hp),
                    damage: enemy.scaleDamage(t.damage),
                });
                enemy.summons.push(createSummon(scale(skipperTemplate)));
                enemy.summons.push(createSummon(scale(ricoTemplate)));
                enemy.summons.push(createSummon(scale(kowalskiTemplate)));
                enemy.summons.push(createSummon(scale(privateTemplate)));
            },
        });
    }
}
