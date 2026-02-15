import EnemyAction, { enemyActions } from "./EnemyAction";
import type Player from "./Player";
import Summon from "./Summon";
import type { Combat } from "../composables/useCombat";
import platypusPortrait from "/enemy_portraits/platypus.png";
import dwambatPortrait from "/player_portraits/dwambat.jpg";
import gnokkaPortrait from "/player_portraits/gnokka.jpg";
import squirrelfPortrait from "/player_portraits/squirrelf.jpg";
import dingorcPortrait from "/player_portraits/dingorc.jpg";
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
    summons: Summon[];

    constructor(enemyParams: EnemyParams) {
        this.name = enemyParams.name;
        this.portrait = enemyParams.portrait;
        this.health = enemyParams.health;
        this.maxHealth = enemyParams.health;
        this.block = 0;

        this.deck = enemyParams.makeDeck();
        this.actions = 1;
        this.impendingActions = [];

        this.attack = 0;
        this.armor = 0;
        this.summons = [];
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

    async executeActions(player: Player, combat: Combat): Promise<void> {
        for (const action of this.impendingActions) {
            action.effect(this, player);
            combat.notify();
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s pause after each enemy action
        }
        this.impendingActions = [];
        
        // Enemy summons run after all enemy actions
        for (const summon of this.summons) {
            summon.effect(combat);
            combat.notify();
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s pause after each enemy summon
        }
    }

    gainHealth(amount: number): void {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        const damageNumbers = useDamageNumbers();
        damageNumbers.addEnemyNumber(amount, 'heal');
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

    gainBlock(amount: number): void {
        this.block += amount;
        const damageNumbers = useDamageNumbers();
        damageNumbers.addEnemyNumber(amount, 'block-gain');
    }

    // copy(): Enemy {
    //     const enemyCopy = new Enemy(
    //         {
    //             name: this.name,
    //             portrait: this.portrait,
    //             health: this.maxHealth,
    //             makeDeck: () => this.deck.map(action => new EnemyAction(
    //                 action.name,
    //                 action.description,
    //                 action.effect
    //             ))
    //         }
    //     );
    //     return enemyCopy;
    // }
}

export default Enemy;

export const platypusParams: EnemyParams = {
    name: "Platypus",
    portrait: platypusPortrait,
    health: 10,

    makeDeck: () => {
        const deck: EnemyAction[] = [];
        const cards: Partial<Record<keyof typeof enemyActions, number>> = {
            "doNothing": 2,
            "weakAttack": 3,
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

export const dwambatParams: EnemyParams = {
    name: "Dwambat",
    portrait: dwambatPortrait,
    health: 15,

    makeDeck: () => {
        const deck: EnemyAction[] = [];
        const cards: Partial<Record<keyof typeof enemyActions, number>> = {
            "doNothing": 2,
            "weakAttack": 4,
            "block": 3,
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

export const gnokkaParams: EnemyParams = {
    name: "Gnokka",
    portrait: gnokkaPortrait,
    health: 20,

    makeDeck: () => {
        const deck: EnemyAction[] = [];
        const cards: Partial<Record<keyof typeof enemyActions, number>> = {
            "doNothing": 2,
            "weakAttack": 3,
            "strongAttack": 3,
            "buff": 2,
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

export const squirrelfParams: EnemyParams = {
    name: "Squirrelf",
    portrait: squirrelfPortrait,
    health: 25,

    makeDeck: () => {
        const deck: EnemyAction[] = [];
        const cards: Partial<Record<keyof typeof enemyActions, number>> = {
            "weakAttack": 3,
            "strongAttack": 4,
            "block": 3,
            "buff": 2,
            "heal": 2,
            "haste": 2,
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

export const dingorcParams: EnemyParams = {
    name: "Dingorc",
    portrait: dingorcPortrait,
    health: 35,

    makeDeck: () => {
        const deck: EnemyAction[] = [];
        const cards: Partial<Record<keyof typeof enemyActions, number>> = {
            "doNothing": 1,
            "weakAttack": 2,
            "strongAttack": 5,
            "block": 4,
            "buff": 3,
            "heal": 3,
            "haste": 2,
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
