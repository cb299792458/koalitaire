import type Enemy from "./Enemy";
import type Player from "./Player";

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
    description: "The enemy attacks you for 1 damage, plus its attack bonus.",
    effect: (enemy, player) => {
        player.health -= 1 + enemy.attackBonus;
    }
}

const strongAttack: EnemyActionParams = {
    name: "Strong Attack",
    description: "The enemy attacks you for 3 damage, plus its attack bonus.",
    effect: (enemy, player) => {
        player.health -= 3 + enemy.attackBonus;
    }
}

const block: EnemyActionParams = {
    name: "Block",
    description: "The enemy blocks for 2, plus its defense bonus.",
    effect: (enemy) => {
        enemy.block += 2 + enemy.defenseBonus;
    }
}

const buff: EnemyActionParams = {
    name: "Buff",
    description: "The enemy buffs itself, increasing its attack and defense bonuses by 1.",
    effect: (enemy) => {
        enemy.attackBonus += 1;
        enemy.defenseBonus += 1;
    }
}

const heal: EnemyActionParams = {
    name: "Heal",
    description: "The enemy heals itself for 2 health.",
    effect: (enemy) => {
        enemy.health += 2;
        if (enemy.health > enemy.maxHealth) {
            enemy.health = enemy.maxHealth;
        }
    }
}

export const enemyActions: Record<string, EnemyActionParams> = {
    doNothing,
    weakAttack,
    strongAttack,
    block,
    buff,
    heal
};
