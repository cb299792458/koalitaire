import Card from "./Card";
import Summon from "./Summon";

import koaPortrait from "/player_portraits/koa.png";
import platypusPortrait from "/enemy_portraits/platypus.png";
import { openMessageModal } from "../stores/modalStore";
import koaDeck from "../game/decks/koaDeck";
import useDamageNumbers from "../composables/useDamageNumbers";

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
    level: number = 1;

    appeal: number;
    attack: number;
    armor: number;
    agility: number;
    arcane: number;

    health: number;
    maxHealth: number;
    manaCrystals: number = 0;
    block: number = 0;
    gold: number;

    deck: Card[];
    summons: Summon[];

    constructor(params: PlayerParams) {
        const { name, portrait, appeal, attack, armor, agility, arcane, health, gold, makeDeck } = params;
        this.name = name;
        this.portrait = portrait;

        this.appeal = appeal;
        this.attack = attack;
        this.armor = armor;
        this.agility = agility;
        this.arcane = arcane;

        this.maxHealth = health;
        this.health = health;
        this.gold = gold;

        this.deck = makeDeck();
        this.summons = [];
    }

    gainHealth(amount: number): void {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        const damageNumbers = useDamageNumbers();
        damageNumbers.addPlayerNumber(amount, 'heal');
    }

    takeDamage(amount: number): void {
        const previousBlock = this.block;
        const blockLost = Math.min(amount, previousBlock);
        let remainingDamage = Math.max(0, amount - this.block);
        this.block = Math.max(0, this.block - amount);
        
        const damageNumbers = useDamageNumbers();
        if (blockLost > 0) {
            damageNumbers.addPlayerNumber(blockLost, 'block-loss');
        }
        
        // Summons take damage after block but before player
        // Process summons in reverse order to safely remove them
        for (let i = this.summons.length - 1; i >= 0 && remainingDamage > 0; i--) {
            const summon = this.summons[i];
            if (!summon) continue;
            
            const summonDamage = Math.min(remainingDamage, summon.hp);
            summon.hp -= summonDamage;
            remainingDamage -= summonDamage;
            
            // Remove summon if HP drops to zero
            if (summon.hp <= 0) {
                this.summons.splice(i, 1);
            }
        }
        
        // Player takes remaining damage
        if (remainingDamage > 0) {
            this.health -= remainingDamage;
            damageNumbers.addPlayerNumber(remainingDamage, 'damage');
        }
        
        if (this.health <= 0) {
            this.health = 0; // Ensure health doesn't go negative
            openMessageModal('YOU DIED');
        }
    }

    gainBlock(amount: number): void {
        this.block += amount;
        const damageNumbers = useDamageNumbers();
        damageNumbers.addPlayerNumber(amount, 'block-gain');
    }

    copy(): Player {
        const playerCopy = new Player({
            name: this.name,
            portrait: this.portrait,
            appeal: this.appeal,
            attack: this.attack,
            armor: this.armor,
            agility: this.agility,
            arcane: this.arcane,
            health: this.maxHealth,
            gold: this.gold,
            makeDeck: () => this.deck.map(card => new Card(
                card.rank,
                card.suit,
                card.name,
                card.description,
                card.effect
            ))
        });
        playerCopy.level = this.level;
        playerCopy.health = this.health;
        playerCopy.manaCrystals = this.manaCrystals;
        playerCopy.block = this.block;
        return playerCopy;
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
        for (const { rank, suit, name, description, effect } of koaDeck) {
            deck.push(new Card(rank, suit, name, description, effect));
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
