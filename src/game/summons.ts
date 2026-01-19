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
        description: "A protective koala companion.",
        maxhp: 5,
        hp: 5,
        race: Race.Koala,
        effect: (_combat: Combat) => {
            // Koala Guard does nothing
        },
    },
    
    // Fire summons
    fireSpirit: {
        name: "Fire Salamander",
        description: "A fiery salamander that burns enemies at the end of each turn.",
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
        description: "A sturdy wombat that provides strong defense each turn.",
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
        description: "A fierce quokka that strikes enemies based on your attack power.",
        maxhp: 4,
        hp: 4,
        race: Race.Quokka,
        effect: (combat: Combat) => {
            const { enemy, player } = combat;
            // Blade Quokka deals damage based on player's attack
            enemy.takeDamage(1 + Math.floor(player.attack / 2));
        },
    },
    
    // Water summons
    healingTide: {
        name: "Healing Platypus",
        description: "A gentle platypus that restores your health each turn.",
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
        description: "A powerful flying squirrel that protects and attacks simultaneously.",
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
