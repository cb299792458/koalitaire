export interface ExpositionCard {
    title: string
    body: string
    imageSrc?: string
}

export const GAME_START_EXPOSITION_CARDS: ExpositionCard[] = [
    {
        title: 'Once Upon a Time...',
        body:
            'In the world of Straya, the five nations lived in conflict, trapped in a violent deadlock.\n\n' +
            'The Sugar Gliders, dwellers of the treetops, associated with the element of wood.\n' +
            'The Mighty Wombats, in their underground caverns, associated with the element of earth.\n' +
            'The Frilled Lizards, inhabitants of the sun-scorched deserts, associated with the element of fire.\n' +
            'The Enigmatic Platypi, at home in the lakes and streams, associated with the element of water.\n' +
            'The Spiny Echidnas, from the razorback ridges, associated with the element of metal.\n\n' +
            'The Friendly Koalas, however, had neither natural defenses nor elemental affinity, and were raided and pillaged by the other nations almost to extinction.'
    },
    {
        title: '...there was a Koala.',
        body:
            'As they were about to make their final stand in their capital city of Koala Lumpur, a brilliant Koala rose to power.\n\n' +
            'His name was Ku the Engineer, though he was no great inventor, nor fighter, nor military strategist; he was a master of diplomacy and negotiation.\n' +
            'Ku managed to turn the tides of war, by channeling the flood of invading armies against each other.\n' +
            'In the end, a tiny kingdom respected by no one was able to bring an end to the Great War of the Five Nations.\n\n' +
            'But that peace came at a great price, and that price was paid in the subjugation of all the animals of Straya to Ku the Great, the Koala King.'
    },
    {
        title: 'The Story So Far...',
        body:
            'You are Koa XIII, the 13th generation descendant of Ku. You\'ve been raised your whole life to succeed your father, as the next Koala King. ' +
            'However, your tyrannical father was too busy enacting his will upon the kingdom and its vassal states, and you were raised by Bearistotle, your personal tutor. ' +
            'Bearistotle introduced you to the works of Koarl Marx at a young age, and traveled with you all across Straya to see the suffering of the Five Nations under Koala rule. ' + 
            'Together with Bearistotle, you\'ve devised a daring plan, to travel to the far corners of Straya, and ally yourself with the leaders of the remnants of the Five Nations.\n\n' +
            'But Bearistotle was betrayed by his narcissistic apprentice, Koalileo, who was jealous of his master\'s attention towards you, and believed the Earth revolved around him. ' +
            'Your father, Kolan Graydad, sent his guards to apprehend the two of you at once; Bearistotle sacrificed himself to allow you to escape, barely in the nick of time. '
    },
    {
        title: 'Slay the Sire',
        body: 
            'It\'s now up to you to follow through with your plan alone, so that your teacher\'s sacrifice was not in vain. ' + 
            'You must travel to as many of the Five Nations as possible, and recruit their leaders to your cause.\n\n' +
            'But the path will be long and perilous, as bandits and brigands roam freely throughout the land, not to mention your father\'s guards. ' +
            'Even then, the leaders of the Five Nations are wise, wary of each other, and of you even more so. They will not risk their people\'s wellbeing for a cause they do not believe in. ' +
            'In order to earn their trust and respect, you will need to prove yourself in combat against their most fearsome champions.\n\n' +
            'Go forth, Koa XIII, to gain support for your cause, bring down Koala rule, and liberate the Animals of Straya!'
    }
]

const ACT_END_EXPOSITION_BY_ACT: Record<number, ExpositionCard[]> = {
    1: [
        {
            title: 'Act I Complete',
            body: 'Jay Lee, the Great Sugar Gliders, has joined your cause. You are now one step closer to liberating the kingdom.'
        },
    ],
    2: [
        {
            title: 'Act II Complete',
            body: 'Gabito, the Great Wombat, has joined your cause. You are now one step closer to liberating the kingdom.'
        },
    ],
    3: [
        {
            title: 'Act III Complete',
            body: 'Pickles, the Great Frilled Lizard, has joined your cause. You are now one step closer to liberating the kingdom.'
        },
    ],
    4: [
        {
            title: 'Act IV Complete',
            body: 'Potato, the Great Platypus, has joined your cause. You are now one step closer to liberating the kingdom.'
        },
    ],
    5: [
        {
            title: 'Act V Complete',
            body: 'Olisong, the Great Echidna, has joined your cause. You are now one step closer to liberating the kingdom.'
        },
    ],
}

export function actEndExpositionCards(actNumber: number): ExpositionCard[] {
    return ACT_END_EXPOSITION_BY_ACT[actNumber] ?? []
}
