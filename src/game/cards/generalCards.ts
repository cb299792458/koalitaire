import type { Combat } from "../../composables/useCombat";
import type { SpellCardParams } from "../../models/Card";
import { Suit } from "../../models/Suit";
import type ManaPool from "../../models/ManaPool";
import { addSummon } from "../summons";
import { Keyword } from "../keywords";
import { Race } from "../../models/Summon";
import { DamageType } from "../../models/DamageType";
import { CombatStatusId } from "../combatStatuses";

const parry: SpellCardParams = {
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

const sparkRitual: SpellCardParams = {
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

const manaBurn: SpellCardParams = {
    rank: 3,
    suit: Suit.Fire,
    name: 'Mana Burn',
    description: 'Deals 1 magic damage for each card in your mana pool.',
    keywords: [Keyword.Magic],
    effect: async (combat: Combat) => {
        const { manaPools } = combat;
        const n = manaPools.pools().reduce(
            (acc: number, pool: ManaPool) => acc + pool.cards.length,
            0
        );
        await combat.damageEnemy(n);
    },
}

export const summonKoallaborator: SpellCardParams = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Koallaborator',
    description: 'Summons a collaborator to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => addSummon(combat, 'collaborator'),
}

const shieldBash: SpellCardParams = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield Bash',
    description: 'Deals damage equal to your block.',
    keywords: [Keyword.Block],
    effect: async (combat: Combat) => {
        const { player } = combat;
        await combat.damageEnemy(player.block);
    },
}

const wrath: SpellCardParams = {
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

const regenerate: SpellCardParams = {
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

const koality: SpellCardParams = {
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

const summonWarKoala: SpellCardParams = {
    rank: 3,
    suit: Suit.Metal,
    name: 'Loyal War Koala',
    description: 'Summons a loyal war koala to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => addSummon(combat, 'warKoala'),
}

const summonWallKoala: SpellCardParams = {
    rank: 3,
    suit: Suit.Earth,
    name: 'Royal Wall Koala',
    description: 'Summons a royal wall koala to protect you.',
    keywords: [Keyword.Summon, Keyword.Block],
    effect: (combat: Combat) => addSummon(combat, 'wallKoala'),
}

const koalitionVictory: SpellCardParams = {
    rank: 6,
    suit: Suit.Metal,
    name: 'Koalition Victory',
    description: 'Summons 3 koalas, then grants all koala summons +1 power and +5 hp.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => {
        const { player } = combat;
        for (let i = 0; i < 3; i++) addSummon(combat, 'collaborator');
        if (!player) return;
        player.summons.filter((summon) => summon.race === Race.Koala).forEach((summon) => {
            summon.hp += 5;
            summon.damage++;
        });
    },
}

const summonCharLizard: SpellCardParams = {
    rank: 6,
    suit: Suit.Fire,
    name: 'Char Lizard',
    description: 'Summons a char lizard to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => addSummon(combat, 'charLizard'),
}

const summonAttackaQuacka: SpellCardParams = {
    rank: 3,
    suit: Suit.Metal,
    name: 'Summon Attacker Quacker',
    description: 'Summons an attacker quacker to protect you.',
    keywords: [Keyword.Summon],
    effect: (combat: Combat) => addSummon(combat, 'attackaQuacka'),
}

const sasageyo: SpellCardParams = {
    rank: 5,
    suit: Suit.Metal,
    name: 'Sasageyo',
    description: 'Remove all your Koala summons. Deal 3 damage to the enemy for each of their hp.',
    keywords: [Keyword.Attack, Keyword.Summon],
    flavorText: 'Sasageyo! Sasageyo! Shinzou wo Sasageyo!',
    effect: async (combat: Combat) => {
        const { player } = combat;
        const koalas = player?.summons.filter((s) => s.race === Race.Koala) ?? [];
        const damage = koalas.reduce((acc, koala) => acc + (koala.hp ?? 0), 0) * 3;
        await combat.damageEnemy(damage);
        if (player) player.summons = player.summons.filter((s) => s.race !== Race.Koala);
    },
};

const despertaFerro: SpellCardParams = {
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

const thunderstruck: SpellCardParams = {
    rank: 4,
    suit: Suit.Fire,
    name: 'Thunderstruck',
    description: 'Deals 25, plus five times your Acumen, ranged magic damage to the enemy.',
    keywords: [Keyword.Magic, Keyword.Ranged],
    effect: async (combat: Combat) => {
        const { player } = combat;
        const damage = 25 + (player?.acumen ?? 0) * 5;
        await combat.damageEnemy(damage, [DamageType.Ranged, DamageType.Magic]);
    },
    flavorText: "You've been thunderstruck!",
}

const brineLag: SpellCardParams = {
    rank: 2,
    suit: Suit.Water,
    name: "Brine Lag",
    description: "Apply Knackered to the enemy for 3 turns.",
    keywords: [Keyword.Knackered],
    effect: (combat: Combat) => {
        combat.enemy?.addCombatStatus(CombatStatusId.Knackered, 3);
    },
};

const riptide: SpellCardParams = {
    rank: 3,
    suit: Suit.Water,
    name: "Riptide",
    description: "Apply Crook to the enemy for 3 turns.",
    keywords: [Keyword.Crook],
    effect: (combat: Combat) => {
        combat.enemy?.addCombatStatus(CombatStatusId.Crook, 3);
    },
};

const redTide: SpellCardParams = {
    rank: 4,
    suit: Suit.Water,
    name: "Red Tide",
    description:
        "Apply 5 Poisoned to the enemy.",
    keywords: [Keyword.Poisoned],
    effect: (combat: Combat) => {
        combat.enemy?.addCombatStatus(CombatStatusId.Poisoned, 5);
    },
};

const venomConcentrate: SpellCardParams = {
    rank: 3,
    suit: Suit.Water,
    name: "Venom Concentrate",
    description:
        "If the enemy is Poisoned: double their Poisoned. If not: apply 1 Poisoned.",
    keywords: [Keyword.Poisoned],
    effect: (combat: Combat) => {
        const enemy = combat.enemy;
        if (!enemy) return;
        const poisoned = enemy.combatStatuses.find((s) => s.id === CombatStatusId.Poisoned);
        if (poisoned) {
            poisoned.turnsRemaining *= 2;
        } else {
            enemy.addCombatStatus(CombatStatusId.Poisoned, 1);
        }
    },
};

export const generalCards: SpellCardParams[] = [
    parry,
    sparkRitual,
    manaBurn,
    summonKoallaborator,
    shieldBash,
    wrath,
    regenerate,
    koality,
    summonWarKoala,
    summonWallKoala,
    koalitionVictory,
    summonCharLizard,
    summonAttackaQuacka,
    despertaFerro,
    sasageyo,
    thunderstruck,
    brineLag,
    riptide,
    redTide,
    venomConcentrate,
];
