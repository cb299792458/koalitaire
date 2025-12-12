import { ref, triggerRef } from 'vue';
import type Enemy from '../models/Enemy';
import type Player from '../models/Player';

export class Combat {
    listeners: Set<() => void>;
    player: Player;
    enemy: Enemy;

    constructor(player: Player, enemy: Enemy) {
        this.player = player;
        this.enemy  = enemy;
        this.listeners = new Set();
    }

    subscribe(fn: () => void) {
        this.listeners.add(fn);
    }

    notify() {
        for (const fn of this.listeners) fn();
    }
}

// useCombat.ts (composable)
const combatRef = ref<Combat | null>(null);

export function useCombat(player: Player, enemy: Enemy) {
    if (!combatRef.value) {
        const combat = new Combat(player, enemy);

        // whenever combat logic changes, notify Vue
        combat.subscribe(() => {
            triggerRef(combatRef);
        });

        combatRef.value = combat;
    }

    return combatRef.value;
}
