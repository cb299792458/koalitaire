import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Card";
import type ManaPool from "../../models/ManaPool";
import { createSummon, summons } from "../summons";

const parry = {
    rank: 1,
    suit: Suit.Wood,
    name: 'Parry the Platypus',
    description: 'Gain 2 block, plus your Agility.',
    effect: (combat: Combat) => {
        const { player } = combat;
        combat.player.gainBlock(2 + (player?.agility ?? 0));
    },
}

const manaBurn = {
    rank: 3,
    suit: Suit.Fire,
    name: 'Mana Burn',
    description: 'Deals 1 magic damage for each card in your mana pool.',
    effect: (combat: Combat) => {
        const { manaPools, enemy } = combat;
        enemy.takeDamage(
            Object.values(manaPools).reduce(
                (acc: number, pool: ManaPool) => acc + pool.cards.length, 0
            )
        );
    },
}

export const koallaborator = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Koallaborator',
    description: 'Summons a collaborator to protect you.',
    effect: (combat: Combat) => {
        const { player } = combat;
        const collaborator = summons.collaborator;
        if (collaborator) {
            player.summons.push(createSummon(collaborator));
        }
    },
}

const shieldBash = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield Bash',
    description: 'Deals damage equal to your block.',
    effect: (combat: Combat) => {
        const { player, enemy } = combat;
        enemy.takeDamage(player.block);
    },
}

const bill = {
    rank: 1,
    suit: Suit.Water,
    name: 'Bill',
    description: 'Draw 2 cards',
    effect: (combat: Combat) => {
        combat.drawCards(2, true);
    },
}

export const generalCards = [
    parry,
    manaBurn,
    koallaborator,
    shieldBash,
    bill,
];
