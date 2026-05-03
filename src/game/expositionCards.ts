export interface ExpositionCard {
    title: string
    body: string
    imageSrc?: string
}

export const GAME_START_EXPOSITION_CARDS: ExpositionCard[] = [
    {
        title: 'A Restless Kingdom',
        body:
            'Koala Lumpur feasts while its vassals starve.\n' +
            'Your father rules with old money and older violence.\n' +
            'Today you begin tearing that order apart.',
    },
    {
        title: 'The Rebel Path',
        body:
            'Defeat your father\'s champions, win over the outer provinces,\n' +
            'and gather enough strength to challenge the throne itself.\n' +
            'Every act is a step toward liberation.',
    },
]

const ACT_END_EXPOSITION_BY_ACT: Record<number, ExpositionCard[]> = {
    1: [
        {
            title: 'Act I Complete',
            body:
                'The first vassals have broken ranks.\n' +
                'Word of your victories spreads from market to village.\n' +
                'Koala Lumpur now sees you as more than a rumor.',
        },
    ],
    2: [
        {
            title: 'Act II Complete',
            body:
                'The old court has started to panic.\n' +
                'Loyalists fortify the capital while the people whisper your name.\n' +
                'The next step decides the fate of the kingdom.',
        },
    ],
    3: [
        {
            title: 'Act III Complete',
            body:
                'Only the final circle remains.\n' +
                'Your father\'s empire is cracking, but a cornered tyrant is dangerous.\n' +
                'Choose your final road carefully.',
        },
    ],
}

export function actEndExpositionCards(actNumber: number): ExpositionCard[] {
    return ACT_END_EXPOSITION_BY_ACT[actNumber] ?? []
}
