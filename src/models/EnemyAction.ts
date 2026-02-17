import type Enemy from "./Enemy";
import type Player from "./Player";
import { DamageType } from "./DamageType";
import { createSummon, summons } from "../game/summons";

interface EnemyActionParams {
    name: string;
    description: string;
    effect: (enemy: Enemy, player: Player) => void;
}

class EnemyAction {
    name: string;
    description: string;
    effect: (enemy: Enemy, player: Player) => void;

    constructor(name: string, description: string, effect: (enemy: Enemy, player: Player) => void) {
        this.name = name;
        this.description = description;
        this.effect = effect;
    }
}

export default EnemyAction;

const doNothing: EnemyActionParams = {
    name: "Do Nothing",
    description: "The enemy does nothing.",
    effect: () => {
    }
}

const weakAttack: EnemyActionParams = {
    name: "Weak Attack",
    description: "The enemy attacks you for 5 damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(5 + enemy.attack);
    }
}

const strongAttack: EnemyActionParams = {
    name: "Strong Attack",
    description: "The enemy attacks you for 15 damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(15 + enemy.attack);
    }
}

const block: EnemyActionParams = {
    name: "Block",
    description: "The enemy blocks for 5, plus its armor.",
    effect: (enemy) => {
        enemy.gainBlock(5 + enemy.armor);
    }
}

const buff: EnemyActionParams = {
    name: "Buff",
    description: "The enemy buffs itself, increasing its attack and armor by 5.",
    effect: (enemy) => {
        enemy.attack += 5;
        enemy.armor += 5;
    }
}

const heal: EnemyActionParams = {
    name: "Heal",
    description: "The enemy heals itself for 10 health.",
    effect: (enemy) => {
        enemy.gainHealth(10);
    }
}

const haste: EnemyActionParams = {
    name: "Haste",
    description: "The enemy haste itself, increasing its actions by 1.",
    effect: (enemy) => {
        enemy.actions += 1;
    }
}

const summonRat: EnemyActionParams = {
    name: "Summon Rat",
    description: "The enemy summons a 1/1 rat.",
    effect: (enemy) => {
        const rat = summons.rat;
        if (rat) {
            enemy.summons.push(createSummon(rat));
        }
    }
}

const weakRangedAttack: EnemyActionParams = {
    name: "Weak Ranged Attack",
    description: "The enemy attacks you for 5 ranged damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(5 + enemy.attack, [DamageType.Ranged]);
    }
}

const strongRangedAttack: EnemyActionParams = {
    name: "Strong Ranged Attack",
    description: "The enemy attacks you for 15 ranged damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(15 + enemy.attack, [DamageType.Ranged]);
    }
}

const weakMagicAttack: EnemyActionParams = {
    name: "Weak Magic",
    description: "The enemy hits you for 5 magic damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(5 + enemy.attack, [DamageType.Magic]);
    }
}

const strongMagicAttack: EnemyActionParams = {
    name: "Strong Magic",
    description: "The enemy hits you for 15 magic damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(15 + enemy.attack, [DamageType.Magic]);
    }
}

export const enemyActions: Record<string, EnemyActionParams> = {
    doNothing,
    summonRat,
    weakRangedAttack,
    strongRangedAttack,
    weakMagicAttack,
    strongMagicAttack,
    block,
    buff,
    heal,
    haste,
    weakAttack,
    strongAttack,
};
