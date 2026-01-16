import { Suit } from "../models/Card";
import type { Combat } from "../composables/useCombat";

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
    ],
    [Suit.Metal]: [
        {
            name: "Crappy Strike",
            description: "Deals 1 damage (not affected by attack) and gain 1 Mana Crystal",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(1);
                player.manaCrystals += 1;
            },
        },
        {
            name: "Very Weak Strike",
            description: "Deals 1 damage, plus 1 damage for each point of attack",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(1 + player.attack);
            },
        },
        {
            name: "Weak Strike",
            description: "Deals 3 damage, plus 1 damage for each point of attack",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(3 + player.attack);
            },
        },
        {
            name: "Moderate Strike",
            description: "Deals 6 damage, plus 1 damage for each point of attack",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(6 + player.attack);
            },
        },
        {
            name: "Strong Strike",
            description: "Deals 10 damage, plus 1 damage for each point of attack",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(10 + player.attack);
            },
        },
        {
            name: "Very Strong Strike",
            description: "Deals 15 damage, plus 1 damage for each point of attack",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(15 + player.attack);
            },
        },
        {
            name: "Critical Strike",
            description: "Deals 21 damage, plus 1 damage for each point of attack",
            effect: (combat: Combat) => {
                const { player, enemy } = combat;
                enemy.takeDamage(21 + player.attack);
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
    ],
}

export default allCards;
