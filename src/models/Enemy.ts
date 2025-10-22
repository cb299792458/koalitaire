import EnemyAction, { enemyActions } from "./EnemyAction";
import type Player from "./Player";
import platypusPortrait from "/enemy_portraits/platypus.png";

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
        this.actions += 1; // Increment actions for the next turn
    }

    takeDamage(damage: number): void {
        const effectiveDamage = Math.max(0, damage - this.block);
        this.health -= effectiveDamage;
        this.block -= effectiveDamage;
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
            "heal": 1
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
