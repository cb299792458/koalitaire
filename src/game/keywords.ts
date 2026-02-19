/**
 * Card keywords enum. Add new keywords here and set their tooltip explanation below.
 */
export enum Keyword {
    Block = 'block',
    Summon = 'summon',
    Draw = 'draw',
    Ranged = 'ranged',
    Magic = 'magic',
    Piercing = 'piercing',
    Backstab = 'backstab',
    Aoe = 'aoe',
    Charges = 'charges',
    ManaDiamond = 'manaDiamond',
}

/** Tooltip explanation for each keyword. Keep tone consistent: "[Keyword]: [concise rule]." */
export const KEYWORD_EXPLANATIONS: Record<Keyword, string> = {
    [Keyword.Block]: 'Block: Prevents damage until end of turn; consumed when you take damage.',
    [Keyword.Summon]: 'Summon: Adds a minion that attacks at end of turn and can take damage for its summoner. Excess damage to summons is not carried over.',
    [Keyword.Draw]: 'Draw: Adds cards from your deck to your hand. Draws as many as possible if the deck has fewer cards than needed.',
    [Keyword.Ranged]: 'Ranged: This damage ignores summons and is dealt directly to the player/enemy.',
    [Keyword.Magic]: 'Magic: This damage ignores armor.',
    [Keyword.Piercing]: 'Piercing: Excess damage to summons is carried over to the next summon or player/enemy.',
    [Keyword.Backstab]: 'Backstab: Deals damage to the back summon first. If there are no summons, deals double damage to the player/enemy.',
    [Keyword.Aoe]: 'Aoe: Deals damage to all summons and to the player/enemy.',
    [Keyword.Charges]: 'Charges: This spell has limited uses per combat. When the last charge is used, the card is trashed.',
    [Keyword.ManaDiamond]: 'Mana Diamond: Can be used to pay for the difference between the card\'s rank and the number of cards in the corresponding mana pool.',
};

export function getKeywordExplanation(keyword: string): string {
    return KEYWORD_EXPLANATIONS[keyword as Keyword] ?? keyword;
}
