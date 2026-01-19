import type { Combat } from '../composables/useCombat';

export interface SummonParams {
    name: string;
    maxhp: number;
    hp: number;
    race: string;
    effect: (combat: Combat) => void;
}

class Summon {
    name: string;
    maxhp: number;
    hp: number;
    race: string;
    effect: (combat: Combat) => void;

    constructor(params: SummonParams) {
        const { name, maxhp, hp, race, effect } = params;
        this.name = name;
        this.maxhp = maxhp;
        this.hp = hp;
        this.race = race;
        this.effect = effect;
    }
}

export default Summon;