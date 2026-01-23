import type { Combat } from '../composables/useCombat';
import Summon, { Race } from '../models/Summon';

export interface SummonTemplate {
    name: string;
    description: string;
    maxhp: number;
    hp: number;
    race: Race;
    effect: (combat: Combat) => void;
}

// Helper function to create a summon instance
export function createSummon(template: SummonTemplate): Summon {
    return new Summon({
        name: template.name,
        description: template.description,
        maxhp: template.maxhp,
        hp: template.hp,
        race: template.race,
        effect: template.effect,
    });
}

// Summon definitions
export const summons: Record<string, SummonTemplate> = {
    // Wood summons
    koala: {
        name: "Koala Guard",
        description: "Grants 1 mana crystal each turn.",
        maxhp: 5,
        hp: 5,
        race: Race.Koala,
        effect: (combat: Combat) => {
            const { player } = combat;
            player.manaCrystals += 1;
        },
    },
    
    // Fire summons
    fireSpirit: {
        name: "Fire Salamander",
        description: "Deals 2 damage to the enemy each turn.",
        maxhp: 3,
        hp: 3,
        race: Race.Salamander,
        effect: (combat: Combat) => {
            const { enemy } = combat;
            // Fire Salamander deals damage to enemy at end of turn
            enemy.takeDamage(2);
        },
    },
    
    // Earth summons
    stoneGolem: {
        name: "Stone Wombat",
        description: "Grants 4 block each turn.",
        maxhp: 8,
        hp: 8,
        race: Race.Wombat,
        effect: (combat: Combat) => {
            const { player } = combat;
            // Stone Wombat grants substantial block
            player.gainBlock(4);
        },
    },
    
    // Metal summons
    bladeFamiliar: {
        name: "Blade Quokka",
        description: "Deals 5 damage to the enemy each turn.",
        maxhp: 4,
        hp: 4,
        race: Race.Quokka,
        effect: (combat: Combat) => {
            const { enemy } = combat;
            // Blade Quokka deals fixed damage
            enemy.takeDamage(5);
        },
    },
    
    // Water summons
    healingTide: {
        name: "Healing Platypus",
        description: "Restores 3 health each turn.",
        maxhp: 5,
        hp: 5,
        race: Race.Platypus,
        effect: (combat: Combat) => {
            const { player } = combat;
            // Healing Platypus restores health at end of turn
            player.gainHealth(3);
        },
    },
    
    // Special summons
    forestGuardian: {
        name: "Forest Guardian",
        description: "Grants 3 block and deals 2 damage to the enemy each turn.",
        maxhp: 10,
        hp: 10,
        race: Race.FlyingSquirrel,
        effect: (combat: Combat) => {
            const { player, enemy } = combat;
            // Forest Guardian both protects and attacks
            player.gainBlock(3);
            enemy.takeDamage(2);
        },
    },
};
