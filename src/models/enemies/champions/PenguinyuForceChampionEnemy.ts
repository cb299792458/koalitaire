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
        captain.gainHealth(5);
        for (const s of captain.summons) {
            s.hp = Math.min(s.hp + 4, 10);
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
    tooltip: "Each turn: applies 1 Knackered and 1 Crook to you.",
    hp: 10,
    damage: 0,
    race: Race.Platypus,
    effect: (combat) => {
        const player = combat.player;
        if (!player) return;
        player.addCombatStatus(CombatStatusId.Knackered, 1);
        player.addCombatStatus(CombatStatusId.Crook, 1);
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
        captain.gainBlock(5);
    },
};

export default class PenguinyuForceChampionEnemy extends Enemy {
    constructor() {
        super({
            name: "Penguinyu Force",
            health: 44,
            tooltip: "Captain Pingu — Skipper, Rico, Kowalski, and Private back him up.",
            generateTurnActions: createSequentialActionGenerator(() => buildDeckFromPattern(["weakAttack"])),
            onCombatStart: (enemy) => {
                enemy.summons.push(createSummon(skipperTemplate));
                enemy.summons.push(createSummon(ricoTemplate));
                enemy.summons.push(createSummon(kowalskiTemplate));
                enemy.summons.push(createSummon(privateTemplate));
            },
        });
    }
}
