import type { Combat } from '../composables/useCombat';
import Summon, { Race } from '../models/Summon';

export interface SummonTemplate {
    name: string;
    description: string;
    /** Tooltip on hover. Defaults to description if not set. */
    tooltip?: string;
    maxhp: number;
    power: number;
    race: Race;
    effect?: (combat: Combat) => void;
}

// Helper function to create a summon instance (starts at max hp)
export function createSummon(template: SummonTemplate): Summon {
    return new Summon({
        name: template.name,
        description: template.description,
        tooltip: template.tooltip,
        maxhp: template.maxhp,
        power: template.power,
        race: template.race,
        effect: template.effect ?? (() => {}),
    });
}

// Summon definitions
export const summons: Record<string, SummonTemplate> = {
    collaborator: {
        name: "Koalaborator",
        description: "Does nothing.",
        maxhp: 1,
        power: 0,
        race: Race.Koala,
        effect: (combat: Combat) => {
            combat.enemy?.takeDamage(0);
        },
        tooltip: "A koala guard, fiercely loyal to Prince Koa, but not particularly fierce in any other regard.",
    },
    warKoala: {
        name: "Loyal War Koala",
        description: "Deals damage equal to the number of koala summons each turn.",
        maxhp: 5,
        power: 0,
        race: Race.Koala,
        effect: (combat: Combat) => {
            combat.enemy?.takeDamage(combat.player?.summons.filter(summon => summon.race === Race.Koala).length ?? 0);
        },
        tooltip: "Koalas together strong.",
    },
    wallKoala: {
        name: "Royal Wall Koala",
        description: "Grants block equal to the number of koala summons each turn.",
        maxhp: 5,
        power: 0,
        race: Race.Koala,
        effect: (combat: Combat) => {
            combat.player?.gainBlock(combat.player?.summons.filter(summon => summon.race === Race.Koala).length ?? 0);
        },
        tooltip: "Koalas together strong.",
    },
    
    // Fire summons
    fireSpirit: {
        name: "Fire Salamander",
        description: "Deals 2 damage to the enemy each turn.",
        maxhp: 3,
        power: 2,
        race: Race.Salamander,
        effect: (combat: Combat) => {
            combat.enemy?.takeDamage(2);
        },
    },
    charLizard: {
        name: "Char Lizard",
        description: "A powerful fire-breathing salamander.",
        maxhp: 20,
        power: 4,
        race: Race.Salamander,
        tooltip: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.",
    },
    
    // Earth summons
    stoneGolem: {
        name: "Stone Wombat",
        description: "Grants 4 block each turn.",
        maxhp: 8,
        power: 0,
        race: Race.Wombat,
        effect: (combat: Combat) => {
            combat.player?.gainBlock(4);
        },
    },
    
    // Metal summons
    bladeFamiliar: {
        name: "Blade Quokka",
        description: "Deals 5 damage to the enemy each turn.",
        maxhp: 4,
        power: 5,
        race: Race.Quokka,
        effect: (combat: Combat) => {
            combat.enemy?.takeDamage(5);
        },
    },
    
    // Water summons
    healingTide: {
        name: "Healing Platypus",
        description: "Restores 3 health each turn.",
        maxhp: 5,
        power: 0,
        race: Race.Platypus,
        effect: (combat: Combat) => {
            combat.player?.gainHealth(3);
        },
    },
    attackaQuacka: {
        name: "Attacker Quacker",
        description: "An aggressive platypus with a lot of energy and power, but on the highway to hell.",
        maxhp: 1,
        power: 5,
        race: Race.Quokka,
        tooltip: "For those about to block (we salute you)",
    },
    
    rat: {
        name: "Rat",
        description: "A rude little rat that likes to bite.",
        maxhp: 1,
        power: 1,
        race: Race.Rat,
        tooltip: "A rude little rat that likes to bite.",
    },

    // Special summons
    forestGuardian: {
        name: "Forest Guardian",
        description: "Grants 3 block and deals 2 damage to the enemy each turn.",
        maxhp: 10,
        power: 2,
        race: Race.FlyingSquirrel,
        effect: (combat: Combat) => {
            combat.player?.gainBlock(3);
            combat.enemy?.takeDamage(2);
        },
    },
};
