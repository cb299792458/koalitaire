import EnemyAction, { enemyActions } from "./EnemyAction";
import type Player from "./Player";
import platypusPortrait from "/enemy_portraits/platypus.png";
import useDamageNumbers from "../composables/useDamageNumbers";

interface EnemyParams {
    name: string;
    portrait: string;
    health: number;
    makeDeck: () => EnemyAction[];
}

class Enemy {
    name: string;
    portrait: string;
    health: number;
    maxHealth: number;
    block: number;

    deck: EnemyAction[];
    actions: number;
    impendingActions: EnemyAction[];

    attack: number;
    armor: number;

    constructor(name: string, portrait: string, health: number, makeDeck: () => EnemyAction[]) {
        this.name = name;
        this.portrait = portrait;
        this.health = health;
        this.maxHealth = health;
        this.block = 0;

        this.deck = makeDeck();
        this.actions = 1;
        this.impendingActions = [];

        this.attack = 0;
        this.armor = 0;
    }

    loadActions(actions: number): void {
        const deckCopy = [...this.deck];

        for (let i = 0; i < actions; i++) {
            if (deckCopy.length === 0) continue;
            const randomIndex = Math.floor(Math.random() * deckCopy.length);
            const action = deckCopy.splice(randomIndex, 1)[0];
            if (action) {
                this.impendingActions.push(action);
            }
        }
    }

    executeActions(player: Player): void {
        for (const action of this.impendingActions) {
            action.effect(this, player);
        }
        this.impendingActions = [];
    }

    takeDamage(damage: number): void {
        const previousBlock = this.block;
        const effectiveDamage = Math.max(0, damage - this.block);
        const blockLost = Math.min(damage, previousBlock);
        this.block = Math.max(0, this.block - damage);
        this.health -= effectiveDamage;
        
        const damageNumbers = useDamageNumbers();
        if (blockLost > 0) {
            damageNumbers.addEnemyNumber(blockLost, 'block-loss');
        }
        if (effectiveDamage > 0) {
            damageNumbers.addEnemyNumber(effectiveDamage, 'damage');
        }
        
        if (this.health < 0) this.health = 0; // Prevent negative health
    }
}

export default Enemy;

export const platypusParams: EnemyParams = {
    name: "Platypus",
    portrait: platypusPortrait,
    health: 10,

    makeDeck: () => {
        const deck: EnemyAction[] = [];
        const cards: Partial<Record<keyof typeof enemyActions, number>> = {
            "doNothing": 3,
            "weakAttack": 3,
            "strongAttack": 1,
            "block": 3,
            "buff": 1,
            "heal": 1,
            "haste": 1,
        }
        for (const [key, count] of Object.entries(cards)) {
            for (let i = 0; i < (count ?? 0); i++) {
                const actionParams = enemyActions[key];
                if (!actionParams) throw new Error(`Unknown enemy action: ${key}`);
                const { name, description, effect } = actionParams;
                deck.push(new EnemyAction(name, description, effect));
            }
        }
        return deck;
    }
};
