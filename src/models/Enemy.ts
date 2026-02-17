import Combatant from "./Combatant";
import type { DamageNumberType } from "./Combatant";
import EnemyAction, { enemyActions } from "./EnemyAction";
import type Player from "./Player";
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
    /** Tooltip text on portrait hover. Defaults to name if not set. */
    tooltip?: string;
    health: number;
    makeDeck: () => EnemyAction[];
}

class Enemy extends Combatant {
    deck: EnemyAction[];
    actions: number;
    impendingActions: EnemyAction[];

    attack: number;

    constructor(enemyParams: EnemyParams) {
        super({
            name: enemyParams.name,
            portrait: enemyParams.portrait,
            health: enemyParams.health,
            armor: 0,
            tooltip: enemyParams.tooltip,
        });

        this.deck = enemyParams.makeDeck();
        this.actions = 1;
        this.impendingActions = [];

        this.attack = 0;
    }

    protected addDamageNumber(amount: number, type: DamageNumberType): void {
        useDamageNumbers().addEnemyNumber(amount, type);
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
}

export default Enemy;

export const platypusParams: EnemyParams = {
    name: "Platypus",
    portrait: platypusPortrait,
    health: 10,
    tooltip: "A really weird looking animal.",

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
            "summonRat": 2,
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
            "weakMagicAttack": 3,
            "strongMagicAttack": 3,
            "buff": 2,
            "summonRat": 2,
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
            "weakRangedAttack": 3,
            "strongRangedAttack": 4,
            "block": 3,
            "buff": 2,
            "heal": 2,
            "summonRat": 2,
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
            "summonRat": 2,
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
