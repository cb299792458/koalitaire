import Enemy, { createSequentialActionGenerator } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const DRAGON_PRINCE_NAME = "Dragon Prince";

const dragonPrinceTemplate: SummonTemplate = {
    name: DRAGON_PRINCE_NAME,
    description: "A young heir roosting in the shadow of the Chronodo — he awaits what comes.",
    tooltip: "Does nothing once summoned. The Chronodo may yet demand a reckoning.",
    hp: 6,
    damage: 0,
    race: Race.Salamander,
};

/** Base damage on each scythe cut and each dragonling strike; Chronodo's attack stat is added to every hit. */
const DAMAGE_PER_HIT = 4;
const SCYTHE_SWINGS = 5;

const chargeOfTheDragonlings = new EnemyAction(
    "The charge of the dragonlings",
    `The Chronodo swings his mighty scythe, La Quinta del Swordo, ${SCYTHE_SWINGS} times. Each dragonling on his side then strikes once. Every hit deals ${DAMAGE_PER_HIT} damage plus the Chronodo's attack. He first calls two Dragon Princes to the field.`,
    async (enemy, _player, combat) => {
        enemy.summons.push(createSummon(dragonPrinceTemplate));
        enemy.summons.push(createSummon(dragonPrinceTemplate));
        combat.notify();

        const hit = async () => {
            await combat.damagePlayer(DAMAGE_PER_HIT + enemy.attack);
            combat.notify();
        };

        for (let i = 0; i < SCYTHE_SWINGS; i++) {
            await hit();
        }

        const livingPrinces = enemy.summons.filter((s) => s.name === DRAGON_PRINCE_NAME && s.hp > 0);
        for (let i = 0; i < livingPrinces.length; i++) {
            await hit();
        }

        combat.notify();
    }
);

const executionOfThePrinceOnTheHill = new EnemyAction(
    "The execution of the prince on the hill",
    "If a Dragon Prince still lives among the summons, he is consumed: the Chronodo gains +1 attack and heals half its missing health. Otherwise, nothing happens. Just another one of the Disasters of War.",
    (enemy, _player, combat) => {
        const idx = enemy.summons.findIndex((s) => s.name === DRAGON_PRINCE_NAME && s.hp > 0);
        if (idx === -1) return;
        enemy.summons.splice(idx, 1);
        enemy.attack += 1;
        const missing = enemy.maxHealth - enemy.health;
        if (missing > 0) {
            enemy.gainHealth(Math.floor(missing / 2));
        }
        combat.notify();
    }
);

export default class ChronodoDragonBossEnemy extends Enemy {
    constructor() {
        super({
            name: "Chronodo Dragon",
            health: 56,
            tooltip: "Boss — alternates a storm of dragonling strikes with a grim rite upon the hill.",
            generateTurnActions: createSequentialActionGenerator(() => [
                chargeOfTheDragonlings,
                executionOfThePrinceOnTheHill,
            ]),
        });
    }
}
