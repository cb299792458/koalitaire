import { Suit } from "../models/Card";
import type { Combat } from "../composables/useCombat";
import { createSummon, summons } from "./summons";

const allCards = {
    [Suit.Wood]: [
        {
            name: "Crappy Shot",
            description: "Deals 1 damage (not affected by agility) and gain 1 Mana Crystal",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(1);
                player.manaCrystals += 1;
            },
        },
        {
            name: "Very Weak Shot",
            description: "Deals 1 damage, plus 1 damage for each point of agility",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(1 + player.agility);
            },
        },
        {
            name: "Weak Shot",
            description: "Deals 3 damage, plus 1 damage for each point of agility",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(3 + player.agility);
            },
        },
        {
            name: "Moderate Shot",
            description: "Deals 6 damage, plus 1 damage for each point of agility",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(6 + player.agility);
            },
        },
        {
            name: "Strong Shot",
            description: "Deals 10 damage, plus 1 damage for each point of agility",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(10 + player.agility);
            },
        },
        {
            name: "Very Strong Shot",
            description: "Deals 15 damage, plus 1 damage for each point of agility",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(15 + player.agility);
            },
        },
        {
            name: "Critical Shot",
            description: "Deals 21 damage, plus 1 damage for each point of agility",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(21 + player.agility);
            },
        },
        {
            name: "Summon Koala",
            description: "Summon a Koala. At the end of each turn, gain 2 block.",
            effect: (combat: Combat) => {
                const { player } = combat;
                const koala = summons.koala;
                if (koala) {
                    player.summons.push(createSummon(koala));
                }
            },
        },
    ],
    [Suit.Fire]: [
        {
            name: "Crappy Blast",
            description: "Deals 1 damage (not affected by arcane) and gain 1 Mana Crystal",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(1);
                player.manaCrystals += 1;
            },
        },
        {
            name: "Very Weak Blast",
            description: "Deals 1 damage, plus 1 damage for each point of arcane",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(1 + player.arcane);
            },
        },
        {
            name: "Weak Blast",
            description: "Deals 3 damage, plus 1 damage for each point of arcane",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(3 + player.arcane);
            },
        },
        {
            name: "Moderate Blast",
            description: "Deals 6 damage, plus 1 damage for each point of arcane",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(6 + player.arcane);
            },
        },
        {
            name: "Strong Blast",
            description: "Deals 10 damage, plus 1 damage for each point of arcane",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(10 + player.arcane);
            },
        },
        {
            name: "Very Strong Blast",
            description: "Deals 15 damage, plus 1 damage for each point of arcane",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(15 + player.arcane);
            },
        },
        {
            name: "Critical Blast",
            description: "Deals 21 damage, plus 1 damage for each point of arcane",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(21 + player.arcane);
            },
        },
        {
            name: "Summon Fire Salamander",
            description: "Summon a Fire Salamander. At the end of each turn, deal 2 damage to the enemy.",
            effect: (combat: Combat) => {
                const { player } = combat;
                const fireSpirit = summons.fireSpirit;
                if (fireSpirit) {
                    player.summons.push(createSummon(fireSpirit));
                }
            },
        },
    ],
    [Suit.Earth]: [
        {
            name: "Crappy Block",
            description: "Gain 1 block (not affected by armor) and 1 Mana Crystal",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(1);
                player.manaCrystals += 1;
            },
        },
        {
            name: "Very Weak Block",
            description: "Gain 1 block, plus 1 block for each point of armor",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(1 + player.armor);
            },
        },
        {
            name: "Weak Block",
            description: "Gain 3 block, plus 1 block for each point of armor",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(3 + player.armor);
            },
        },
        {
            name: "Moderate Block",
            description: "Gain 6 block, plus 1 block for each point of armor",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(6 + player.armor);
            },
        },
        {
            name: "Strong Block",
            description: "Gain 10 block, plus 1 block for each point of armor",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(10 + player.armor);
            },
        },
        {
            name: "Very Strong Block",
            description: "Gain 15 block, plus 1 block for each point of armor",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(15 + player.armor);
            },
        },
        {
            name: "Critical Block",
            description: "Gain 21 block, plus 1 block for each point of armor",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(21 + player.armor);
            },
        },
        {
            name: "Summon Stone Wombat",
            description: "Summon a Stone Wombat. At the end of each turn, gain 4 block.",
            effect: (combat: Combat) => {
                const { player } = combat;
                const stoneGolem = summons.stoneGolem;
                if (stoneGolem) {
                    player.summons.push(createSummon(stoneGolem));
                }
            },
        },
    ],
    [Suit.Metal]: [
        {
            name: "Crappy Channel",
            description: "Gain 1 Mana Crystal",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 1;
            },
        },
        {
            name: "Very Weak Channel",
            description: "Gain 2 Mana Crystals",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 2;
            },
        },
        {
            name: "Weak Channel",
            description: "Gain 4 Mana Crystals",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 4;
            },
        },
        {
            name: "Moderate Channel",
            description: "Gain 6 Mana Crystals",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 6;
            },
        },
        {
            name: "Strong Channel",
            description: "Gain 9 Mana Crystals",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 9;
            },
        },
        {
            name: "Very Strong Channel",
            description: "Gain 13 Mana Crystals",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 13;
            },
        },
        {
            name: "Critical Channel",
            description: "Gain 18 Mana Crystals",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.manaCrystals += 18;
            },
        },
        {
            name: "Summon Blade Quokka",
            description: "Summon a Blade Quokka. At the end of each turn, deal 1 + floor(attack/2) damage to the enemy.",
            effect: (combat: Combat) => {
                const { player } = combat;
                const bladeFamiliar = summons.bladeFamiliar;
                if (bladeFamiliar) {
                    player.summons.push(createSummon(bladeFamiliar));
                }
            },
        },
    ],
    [Suit.Water]: [
        {
            name: "Crappy Dodge",
            description: "Gain 1 block (not affected by agility) and 1 Mana Crystal",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(1);
                player.manaCrystals += 1;
            },
        },
        {
            name: "Very Weak Dodge",
            description: "Gain 1 block, plus 1 block for each point of agility",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(1 + player.agility);
            },
        },
        {
            name: "Weak Dodge",
            description: "Gain 3 block, plus 1 block for each point of agility",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(3 + player.agility);
            },
        },
        {
            name: "Moderate Dodge",
            description: "Gain 6 block, plus 1 block for each point of agility",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(6 + player.agility);
            },
        },
        {
            name: "Strong Dodge",
            description: "Gain 10 block, plus 1 block for each point of agility",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(10 + player.agility);
            },
        },
        {
            name: "Very Strong Dodge",
            description: "Gain 15 block, plus 1 block for each point of agility",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(15 + player.agility);
            },
        },
        {
            name: "Critical Dodge",
            description: "Gain 21 block, plus 1 block for each point of agility",
            effect: (combat: Combat) => {
                const { player } = combat;
                player.gainBlock(21 + player.agility);
            },
        },
        {
            name: "Summon Healing Platypus",
            description: "Summon a Healing Platypus. At the end of each turn, restore 3 health.",
            effect: (combat: Combat) => {
                const { player } = combat;
                const healingTide = summons.healingTide;
                if (healingTide) {
                    player.summons.push(createSummon(healingTide));
                }
            },
        },
        {
            name: "Summon Forest Guardian",
            description: "Summon a Forest Guardian. At the end of each turn, gain 3 block and deal 2 damage to the enemy.",
            effect: (combat: Combat) => {
                const { player } = combat;
                const forestGuardian = summons.forestGuardian;
                if (forestGuardian) {
                    player.summons.push(createSummon(forestGuardian));
                }
            },
        },
    ],
}

export default allCards;
