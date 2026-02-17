import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Card";
import type ManaPool from "../../models/ManaPool";
import { createSummon, summons } from "../summons";
import { Keyword } from "../keywords";
import { Race } from "../../models/Summon";

const parry = {
    rank: 1,
    suit: Suit.Wood,
    name: 'Parry the Platypus',
    description: 'Gain 2 block, plus your Agility.',
    keywords: [Keyword.Block],
    effect: (combat: Combat) => {
        const { player } = combat;
        combat.player.gainBlock(2 + (player?.agility ?? 0));
    },
}

const barkRitual = {
    rank: 1,
    suit: Suit.Wood,
    name: 'Bark Ritual',
    description: 'Add 3 mana crystals.',
    keywords: [Keyword.ManaCrystal],
    effect: (combat: Combat) => {
        combat.player.manaCrystals += 3;
    },
}

const manaBurn = {
    rank: 3,
    suit: Suit.Fire,
    name: 'Mana Burn',
    description: 'Deals 1 magic damage for each card in your mana pool.',
    keywords: [Keyword.Magic],
    effect: (combat: Combat) => {
        const { manaPools, enemy } = combat;
        enemy.takeDamage(
            Object.values(manaPools).reduce(
                (acc: number, pool: ManaPool) => acc + pool.cards.length, 0
            )
        );
    },
}

export const summonKoallaborator = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Koallaborator',
    description: 'Summons a collaborator to protect you.',
    keywords: [Keyword.Summon],
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
    keywords: [Keyword.Block],
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
    keywords: [Keyword.Draw],
    effect: (combat: Combat) => {
        combat.drawCards(2, true);
    },
}

const wrath = {
    rank: 3,
    suit: Suit.Fire,
    name: 'Great Barrier Wrath',
    description: 'Destroys all summons on both sides.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player, enemy } = combat;
        player.summons = [];
        enemy.summons = [];
    },
}

const bde = {
    rank: 6,
    suit: Suit.Earth,
    name: 'Big Dig Energy',
    description: 'Returns all mana cards from the compost to your hand.',
    effect: (combat: Combat) => {
        const { compost } = combat;
        compost.cards.forEach(card => {
            combat.hand.addCard(card);
        });
    },
}

const regenerate = {
    rank: 4,
    suit: Suit.Fire,
    name: 'Regenerate',
    description: 'Restores 10 health.',
    effect: (combat: Combat) => {
        const { player } = combat;
        player.gainHealth(10);
    },
    charges: 1,
}

// const koality = {
//     rank: 2,
//     suit: Suit.Metal,
//     name: 'A Chance to Show His Quality',
//     description: 'Gain +5 to all stats this combat.',
//     effect: (combat: Combat) => {
//         const { player } = combat;
//         player.attack += 5;
//         player.armor += 5;
//         player.agility += 5;
//         player.arcane += 5;
//         player.appeal += 5;
//     },
//     charges: 1,
// }

const summonWarKoala = {
    rank: 3,
    suit: Suit.Metal,
    name: 'Loyal War Koala',
    description: 'Summons a loyal war koala to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        const warKoala = summons.warKoala;
        if (warKoala) {
            player.summons.push(createSummon(warKoala));
        }
    },
}

const summonWallKoala = {
    rank: 3,
    suit: Suit.Earth,
    name: 'Royal Wall Koala',
    description: 'Summons a royal wall koala to protect you.',
    keywords: [Keyword.Summon, Keyword.Block],
    effect: (combat: Combat) => {
        const { player } = combat;
        const wallKoala = summons.wallKoala;
        if (wallKoala) {
            player.summons.push(createSummon(wallKoala));
        }
    },
}

const koalitionVictory = {
    rank: 6,
    suit: Suit.Metal,
    name: 'Koalition Victory',
    description: 'Summons 3 koalas, then fully heals all koala summons and grants them +1 power and +5 hp.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        for (let i = 0; i < 3; i++) {
            const koala = summons.collaborator;
            if (koala) {
                player.summons.push(createSummon(koala));
            }
        }
        player.summons.filter(summon => summon.race === Race.Koala).forEach(summon => {
            summon.maxhp += 5;
            summon.hp = summon.maxhp;
            summon.power++;
        });
    },
}

const summonCharLizard = {
    rank: 6,
    suit: Suit.Fire,
    name: 'Char Lizard',
    description: 'Summons a char lizard to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        const charLizard = summons.charLizard;
        if (charLizard) {
            player.summons.push(createSummon(charLizard));
        }
    },
}

const summonAttackaQuacka = {
    rank: 3,
    suit: Suit.Metal,
    name: 'Summon Attacker Quacker',
    description: 'Summons an attacker quacker to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        const attackaQuacka = summons.attackaQuacka;
        if (attackaQuacka) {
            player.summons.push(createSummon(attackaQuacka));
        }
    },
}

export const generalCards = [
    parry,
    barkRitual,
    manaBurn,
    summonKoallaborator,
    shieldBash,
    bill,
    wrath,
    bde,
    regenerate,
    // koality, // TODO: fix permanence bug
    summonWarKoala,
    summonWallKoala,
    koalitionVictory,
    summonCharLizard,
    summonAttackaQuacka,
];
