import EnemyAction, { enemyActions } from "./EnemyAction";
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

    attackBonus: number;
    defenseBonus: number;

    constructor(name: string, portrait: string, health: number, makeDeck: () => EnemyAction[]) {
        this.name = name;
        this.portrait = portrait;
        this.health = health;
        this.maxHealth = health;
        this.block = 0;

        this.deck = makeDeck();
        this.actions = 1;
        this.impendingActions = [];

        this.attackBonus = 0;
        this.defenseBonus = 0;
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
