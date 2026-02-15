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
    hp?: number; // defaults to maxhp if omitted
    power: number;
    race: Race;
    effect?: (combat: Combat) => void;
}

class Summon {
    name: string;
    description: string;
    maxhp: number;
    hp: number;
    power: number;
    race: Race;
    effect: (combat: Combat) => void;

    constructor(params: SummonParams) {
        const { name, description, maxhp, power, race } = params;
        this.name = name;
        this.description = description;
        this.maxhp = maxhp;
        this.hp = params.hp ?? maxhp;
        this.power = power;
        this.race = race;
        this.effect = params.effect ?? (() => {});
    }
}

export default Summon;
