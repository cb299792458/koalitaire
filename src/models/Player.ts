import Card from "./Card";

import koaPortrait from "/player_portraits/koa.png";
import platypusPortrait from "/enemy_portraits/platypus.png";
import { suits } from "./Card";

export interface PlayerParams {
    name: string;
    portrait: string;

    charisma: number;
    dexterity: number;
    intelligence: number;
    strength: number;

    health: number;
    gold: number;

    makeDeck: () => Card[];
}

class Player {
    name: string;
    portrait: string;

    charisma: number;
    dexterity: number;
    intelligence: number;
    strength: number;

    health: number;
    maxHealth: number;
    gold: number;

    deck: Card[];

    constructor(params: PlayerParams) {
        const { name, portrait, strength, dexterity, intelligence, charisma, health, gold, makeDeck } = params;
        this.name = name;
        this.portrait = portrait;

        this.strength = strength;
        this.dexterity = dexterity;
        this.intelligence = intelligence;
        this.charisma = charisma;

        this.maxHealth = health;
        this.health = health;
        this.gold = gold;

        this.deck = makeDeck();
    }
}

export const koaParams: PlayerParams = {
    name: "Koa XIII",
    portrait: koaPortrait,

    charisma: 5,
    dexterity: 3,
    intelligence: 3,
    strength: 3,

    health: 100,
    gold: 150,

    makeDeck: () => {
        const deck: Card[] = [];
        for (const suit of suits) {
            for (let rank = 1; rank <= 9; rank++) {
                deck.push(new Card(rank, suit));
            }
        }
        return deck;
    }
};

export const nextCharacterParams: PlayerParams = {
    name: "Next Character",
    portrait: platypusPortrait,

    charisma: 0,
    dexterity: 0,
    intelligence: 0,
    strength: 0,

    health: 0,
    gold: 0,

    makeDeck: () => [] // Placeholder for next character's deck
};

export default Player;
