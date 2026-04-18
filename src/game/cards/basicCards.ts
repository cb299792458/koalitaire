import type { Combat } from "../../composables/useCombat";
import type { SpellCardParams } from "../../models/Card";
import { Keyword } from "../keywords";


const basicAttack: SpellCardParams = {
    rank: 0,
    suit: null,
    name: 'Basic Attack',
    description: 'Deals damage equal to your attack.',
    keywords: [Keyword.Attack],
    castAnimationDirection: 'right',
    effect: async (combat: Combat) => {
        const player = combat.player;
        await combat.damageEnemy(player.attack);
    },
}

const basicBlock: SpellCardParams = {
    rank: 0,
    suit: null,
    name: 'Basic Block',
    description: 'Gains block equal to your armor.',
    keywords: [Keyword.Block],
    castAnimationDirection: 'left',
    effect: (combat: Combat) => {
        const player = combat.player;
        player.gainBlock(player.armor);
    },
}

export const basicCards: SpellCardParams[] = [
    basicAttack,
    basicAttack,
    basicAttack,
    basicBlock,
    basicBlock,
]
