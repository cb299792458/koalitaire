import Card from "./Card";

import koaPortrait from "/player_portraits/koa.png";
import platypusPortrait from "/enemy_portraits/platypus.png";
import { suits } from "./Card";
import { openMessageModal } from "../stores/modalStore";

export interface PlayerParams {
    name: string;
    portrait: string;

    appeal: number;
    attack: number;
    armor: number;
    agility: number;
    arcane: number;

    health: number;
    gold: number;

    makeDeck: () => Card[];
}

class Player {
    name: string;
    portrait: string;
    level: number;

    appeal: number;
    attack: number;
    armor: number;
    agility: number;
    arcane: number;

    health: number;
    maxHealth: number;
    block: number;
    gold: number;

    deck: Card[];

    constructor(params: PlayerParams) {
        const { name, portrait, appeal, attack, armor, agility, arcane, health, gold, makeDeck } = params;
        this.name = name;
        this.portrait = portrait;
        this.level = 1;

        this.appeal = appeal;
        this.attack = attack;
        this.armor = armor;
        this.agility = agility;
        this.arcane = arcane;

        this.maxHealth = health;
        this.health = health;
        this.block = 0;
        this.gold = gold;

        this.deck = makeDeck();
    }

    takeDamage(amount: number): void {
        const damage = Math.max(0, amount - this.block);
        this.health -= damage;
        this.block = Math.max(0, this.block - amount);
        if (this.health <= 0) {
            this.health = 0; // Ensure health doesn't go negative
            openMessageModal('YOU DIED');
        }
    }
}

export const koaParams: PlayerParams = {
    name: "Koa XIII",
    portrait: koaPortrait,

    appeal: 5,
    attack: 3,
    armor: 3,
    agility: 3,
    arcane: 3,

    health: 100,
    gold: 150,

    makeDeck: () => {
        const deck: Card[] = [];
        for (const suit of suits) {
            for (let rank = 1; rank <= 7; rank++) {
                deck.push(new Card(rank, suit));
            }
        }
        return deck;
    }
};

export const nextCharacterParams: PlayerParams = {
    name: "Next Character",
    portrait: platypusPortrait,

    appeal: 0,
    attack: 0,
    armor: 0,
    agility: 0,
    arcane: 0,

    health: 0,
    gold: 0,

    makeDeck: () => [] // Placeholder for next character's deck
};

export default Player;
