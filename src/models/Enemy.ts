import Combatant from "./Combatant";
import type { DamageNumberType } from "./Combatant";
import EnemyAction, { enemyActions } from "./EnemyAction";
import type Player from "./Player";
import type { Combat } from "../composables/useCombat";
import useDamageNumbers from "../composables/useDamageNumbers";

export type EnemyActionKey = keyof typeof enemyActions;
export interface EnemyTurnContext {
    actions: number;
    turnNumber: number;
    enemy: Enemy;
    player: Player;
    combat: Combat;
}

export type EnemyTurnActionGenerator = (context: EnemyTurnContext) => EnemyAction[];

/** Build one action instance from the shared action table. */
export function enemyActionFromKey(key: string): EnemyAction {
    const actionParams = enemyActions[key];
    if (!actionParams) throw new Error(`Unknown enemy action: ${key}`);
    const { name, description, effect } = actionParams;
    return new EnemyAction(name, description, effect);
}

/** Weighted bag of actions (order not meaningful with random action generators). */
export function buildDeckFromCounts(
    cards: Partial<Record<EnemyActionKey, number>>
): EnemyAction[] {
    const deck: EnemyAction[] = [];
    for (const [key, count] of Object.entries(cards)) {
        for (let i = 0; i < (count ?? 0); i++) {
            deck.push(enemyActionFromKey(key));
        }
    }
    return deck;
}

/** One cycle of a pattern in order (use with a sequential action generator). */
export function buildDeckFromPattern(keys: readonly EnemyActionKey[]): EnemyAction[] {
    return keys.map((key) => enemyActionFromKey(key));
}

/** Build a per-turn generator that samples actions randomly without replacement. */
export function createRandomActionGenerator(makeDeck: () => EnemyAction[]): EnemyTurnActionGenerator {
    const deck = makeDeck();
    return ({ actions }: EnemyTurnContext): EnemyAction[] => {
        const copy = [...deck];
        const out: EnemyAction[] = [];
        for (let i = 0; i < actions && copy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * copy.length);
            const action = copy.splice(randomIndex, 1)[0];
            if (action) out.push(action);
        }
        return out;
    };
}

/** Build a per-turn generator that walks a deck in order and repeats forever. */
export function createSequentialActionGenerator(makeDeck: () => EnemyAction[]): EnemyTurnActionGenerator {
    const deck = makeDeck();
    let sequenceIndex = 0;
    return ({ actions }: EnemyTurnContext): EnemyAction[] => {
        if (deck.length === 0) return [];
        const out: EnemyAction[] = [];
        for (let i = 0; i < actions; i++) {
            const idx = sequenceIndex % deck.length;
            const action = deck[idx];
            if (action) out.push(action);
            sequenceIndex += 1;
        }
        return out;
    };
}

/** Compose many generators into one turn output. */
export function combineActionGenerators(
    ...generators: EnemyTurnActionGenerator[]
): EnemyTurnActionGenerator {
    return (context: EnemyTurnContext): EnemyAction[] =>
        generators.flatMap((generator) => generator(context));
}

/** Branch between two generators based on live turn context. */
export function conditionalActionGenerator(
    predicate: (context: EnemyTurnContext) => boolean,
    whenTrue: EnemyTurnActionGenerator,
    whenFalse: EnemyTurnActionGenerator = () => []
): EnemyTurnActionGenerator {
    return (context: EnemyTurnContext): EnemyAction[] =>
        (predicate(context) ? whenTrue : whenFalse)(context);
}

export interface EnemyParams {
    name: string;
    portrait?: string;
    /** Tooltip text on portrait hover. Defaults to name if not set. */
    tooltip?: string;
    health: number;
    /** Produces the exact action(s) this enemy will load for the current turn. */
    generateTurnActions: EnemyTurnActionGenerator;
    /** Default 0. Shown in UI only when non-zero. */
    attack?: number;
    armor?: number;
    appeal?: number;
    agility?: number;
    acumen?: number;
}

class Enemy extends Combatant {
    actions: number;
    impendingActions: EnemyAction[];

    attack: number;
    appeal: number;
    agility: number;
    acumen: number;
    turnNumber: number;

    private readonly generateTurnActions: EnemyTurnActionGenerator;

    protected constructor(enemyParams: EnemyParams) {
        super({
            name: enemyParams.name,
            portrait: enemyParams.portrait ?? "/unknown.jpg",
            health: enemyParams.health,
            armor: enemyParams.armor ?? 0,
            tooltip: enemyParams.tooltip,
        });

        this.generateTurnActions = enemyParams.generateTurnActions;
        this.actions = 1;
        this.impendingActions = [];

        this.attack = enemyParams.attack ?? 0;
        this.appeal = enemyParams.appeal ?? 0;
        this.agility = enemyParams.agility ?? 0;
        this.acumen = enemyParams.acumen ?? 0;
        this.turnNumber = 0;
    }

    protected addDamageNumber(amount: number, type: DamageNumberType): void {
        useDamageNumbers().addEnemyNumber(amount, type);
    }

    loadActions(actions: number, player: Player, combat: Combat): void {
        this.turnNumber += 1;
        const chosen = this.generateTurnActions({
            actions,
            turnNumber: this.turnNumber,
            enemy: this,
            player,
            combat,
        });
        this.impendingActions.push(...chosen);
    }

    async executeActions(player: Player, combat: Combat): Promise<void> {
        for (const action of this.impendingActions) {
            await Promise.resolve(action.effect(this, player, combat));
            combat.notify();
            await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5s pause after each enemy action
        }
        this.impendingActions = [];

        // Enemy summons run after all enemy actions
        for (const summon of this.summons) {
            await Promise.resolve(summon.effect(combat));
            combat.notify();
            await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5s pause after each enemy summon
        }
    }
}

/** Minimal enemy for combat bootstrap before a real fight starts. */
export class PlaceholderEnemy extends Enemy {
    constructor() {
        super({
            name: "",
            health: 0,
            generateTurnActions: () => [],
        });
    }
}

export default Enemy;
