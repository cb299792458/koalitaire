import type Enemy from "./Enemy";
import type Player from "./Player";
import useDamageNumbers from "../composables/useDamageNumbers";

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
    description: "The enemy attacks you for 1 damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(1 + enemy.attack);
    }
}

const strongAttack: EnemyActionParams = {
    name: "Strong Attack",
    description: "The enemy attacks you for 3 damage, plus its attack.",
    effect: (enemy, player) => {
        player.takeDamage(3 + enemy.attack);
    }
}

const block: EnemyActionParams = {
    name: "Block",
    description: "The enemy blocks for 2, plus its armor.",
    effect: (enemy) => {
        const blockGain = 2 + enemy.armor;
        enemy.block += blockGain;
        const damageNumbers = useDamageNumbers();
        damageNumbers.addEnemyNumber(blockGain, 'block-gain');
    }
}

const buff: EnemyActionParams = {
    name: "Buff",
    description: "The enemy buffs itself, increasing its attack and armor by 1.",
    effect: (enemy) => {
        enemy.attack += 1;
        enemy.armor += 1;
    }
}

const heal: EnemyActionParams = {
    name: "Heal",
    description: "The enemy heals itself for 2 health.",
    effect: (enemy) => {
        const previousHealth = enemy.health;
        enemy.health += 2;
        if (enemy.health > enemy.maxHealth) {
            enemy.health = enemy.maxHealth;
        }
        const healAmount = enemy.health - previousHealth;
        if (healAmount > 0) {
            const damageNumbers = useDamageNumbers();
            damageNumbers.addEnemyNumber(healAmount, 'heal');
        }
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
