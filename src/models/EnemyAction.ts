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

export const enemyActions: Record<string, EnemyActionParams> = {
    doNothing,
    weakAttack,
    strongAttack,
    block,
    buff,
    heal,
    haste,
};
