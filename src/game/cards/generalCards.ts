import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Suit";
import type ManaPool from "../../models/ManaPool";
import { addSummon } from "../summons";
import { Keyword } from "../keywords";
import { Race } from "../../models/Summon";
import { DamageType } from "../../models/DamageType";

const parry = {
    rank: 1,
    suit: Suit.Wood,
    name: 'Parry the Platypus',
    description: 'Gain 2 block, plus your Agility.',
    keywords: [Keyword.Block],
    effect: (combat: Combat) => {
        const { player } = combat;
        if (player) player.gainBlock(2 + (player.agility ?? 0));
    },
}

const sparkRitual = {
    rank: 1,
    suit: Suit.Fire,
    name: 'Spark Ritual',
    description: 'Add 3 mana diamonds.',
    keywords: [Keyword.ManaDiamond],
    effect: (combat: Combat) => {
        const { player } = combat;
        if (player) player.manaDiamonds += 3;
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
            manaPools.pools().reduce(
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
    effect: (combat: Combat) => addSummon(combat, 'collaborator'),
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
        const { compost, hand } = combat;
        const manaCards = compost.cards.filter((card) => !card.isSpell);
        compost.cards = compost.cards.filter((card) => card.isSpell);
        manaCards.forEach((card) => hand.addCard(card));
    },
}

const regenerate = {
    rank: 4,
    suit: Suit.Fire,
    name: 'Regenerate',
    description: 'Restores 10 health.',
    keywords: [Keyword.Heal],
    effect: (combat: Combat) => {
        const { player } = combat;
        player.gainHealth(10);
    },
    charges: 1,
}

const koality = {
    rank: 2,
    suit: Suit.Metal,
    name: 'A Chance to Show His Quality',
    description: 'Gain +5 to all stats this combat.',
    effect: (combat: Combat) => {
        const { player } = combat;
        player.attack += 5;
        player.armor += 5;
        player.agility += 5;
        player.acumen += 5;
        player.appeal += 5;
    },
    charges: 1,
}

const summonWarKoala = {
    rank: 3,
    suit: Suit.Metal,
    name: 'Loyal War Koala',
    description: 'Summons a loyal war koala to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => addSummon(combat, 'warKoala'),
}

const summonWallKoala = {
    rank: 3,
    suit: Suit.Earth,
    name: 'Royal Wall Koala',
    description: 'Summons a royal wall koala to protect you.',
    keywords: [Keyword.Summon, Keyword.Block],
    effect: (combat: Combat) => addSummon(combat, 'wallKoala'),
}

const koalitionVictory = {
    rank: 6,
    suit: Suit.Metal,
    name: 'Koalition Victory',
    description: 'Summons 3 koalas, then fully heals all koala summons and grants them +1 power and +5 hp.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        for (let i = 0; i < 3; i++) addSummon(combat, 'collaborator');
        if (!player) return;
        player.summons.filter((summon) => summon.race === Race.Koala).forEach((summon) => {
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
    effect: (combat: Combat) => addSummon(combat, 'charLizard'),
}

const summonAttackaQuacka = {
    rank: 3,
    suit: Suit.Metal,
    name: 'Summon Attacker Quacker',
    description: 'Summons an attacker quacker to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => addSummon(combat, 'attackaQuacka'),
}

const shinzouWoSasageyo = {
    rank: 5,
    suit: Suit.Metal,
    name: 'Shinzou wo Sasageyo',
    description: 'Remove all your Koala summons. Deal 10 damage to the enemy for each.',
    keywords: [Keyword.Attack, Keyword.Summon],
    flavorText: 'Sasageyo! Sasageyo! Shinzou wo Sasageyo!',
    effect: (combat: Combat) => {
        const { player, enemy } = combat;
        const koalas = player?.summons.filter((s) => s.race === Race.Koala) ?? [];
        const count = koalas.length;
        if (player) player.summons = player.summons.filter((s) => s.race !== Race.Koala);
        if (count > 0 && enemy) enemy.takeDamage(10 * count);
    },
};

const despertaFerro = {
    rank: 4,
    suit: Suit.Metal,
    name: 'Desperta Ferro',
    description: 'Summons koalas equal to your Appeal.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        const count = player?.appeal ?? 0;
        for (let i = 0; i < count; i++) addSummon(combat, 'collaborator');
    },
};

const thunderstruck = {
    rank: 4,
    suit: Suit.Fire,
    name: 'Thunderstruck',
    description: 'Deals 25, plus five times your Acumen, ranged magic damage to the enemy.',
    keywords: [Keyword.Magic, Keyword.Ranged],
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 25 + (player?.acumen ?? 0) * 5;
        enemy.takeDamage(damage, [DamageType.Ranged, DamageType.Magic]);
    },
    flavorText: "You've been thunderstruck!",
}

export const generalCards = [
    parry,
    sparkRitual,
    manaBurn,
    summonKoallaborator,
    shieldBash,
    bill,
    wrath,
    bde,
    regenerate,
    koality,
    summonWarKoala,
    summonWallKoala,
    koalitionVictory,
    summonCharLizard,
    summonAttackaQuacka,
    despertaFerro,
    shinzouWoSasageyo,
    thunderstruck,
];
