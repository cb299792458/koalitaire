import type { Combat } from '../composables/useCombat';

const RaceValues = {
    Koala: "koala",
    FlyingSquirrel: "flying squirrel",
    Salamander: "salamander",
    Wombat: "wombat",
    Quokka: "quokka",
    Platypus: "platypus",
    Dingo: "dingo",
} as const;

export type Race = typeof RaceValues[keyof typeof RaceValues];
export const Race: typeof RaceValues = RaceValues;

export interface SummonParams {
    name: string;
    description: string;
    maxhp: number;
    hp: number;
    race: Race;
    effect: (combat: Combat) => void;
}

class Summon {
    name: string;
    description: string;
    maxhp: number;
    hp: number;
    race: Race;
    effect: (combat: Combat) => void;

    constructor(params: SummonParams) {
        const { name, description, maxhp, hp, race, effect } = params;
        this.name = name;
        this.description = description;
        this.maxhp = maxhp;
        this.hp = hp;
        this.race = race;
        this.effect = effect;
    }
}

export default Summon;