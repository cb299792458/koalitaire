export interface MapTip {
    title: string;
    body: string;
    imageSrc?: string;
}

export const MAP_TIPS: MapTip[] = [
    {
        title: 'On Spending Mana',
        body: 'If you spend mana to cast a spell, the mana cards spent will be moved to your recycling pile. That means you won\'t be able to add more mana cards to that mana pool this turn.',
    },
    {
        title: 'On Saving Spells',
        body: 'You can see your enemy\'s intents every turn. There\'s no need to block an enemy that isn\'t attacking you or deal damage if you can\'t overcome an enemy\'s block. Sometimes it\'s better to save your spells.',
    },
    {
        title: 'On Editing Your Deck',
        body: 'You can choose which spells to include in your deck with the deck button above. Try to balance your spells\' ranks and suits as well as their effects, as spell cards can be stacked by rank and suit just like mana cards.'
    },
    {
        title: 'On Spell Card Suits and Ranks',
        body: 'Consider the Suits and Ranks of the spell cards in your deck. It\'s generally helpful to try to stack many spell cards in the same column, to be able to move your mana cards to the mana pools.',
    }
];
