import Card from "./Card";

import koaPortrait from "../assets/portraits/koa.png";
import { suits } from "./Card";

interface PlayerParams {
    name: string;
    portrait: string;

    charisma: number;
    dexterity: number;
    intelligence: number;
    strength: number;

    health: number;
    armor: number;
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

    maxHealth: number;
    health: number;
    armor: number;
    gold: number;

    deck: Card[];

    constructor(params: PlayerParams) {
        this.name = params.name;
        this.portrait = params.portrait;

        this.strength = params.strength;
        this.dexterity = params.dexterity;
        this.intelligence = params.intelligence;
        this.charisma = params.charisma;

        this.maxHealth = params.health;
        this.health = params.health;
        this.armor = params.armor;
        this.gold = params.gold;

        this.deck = params.makeDeck();
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
    armor: 5,
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

export default Player;
