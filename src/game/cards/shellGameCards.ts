import type { Combat } from "../../composables/useCombat";
import { SpellCard, type SpellCardParams } from "../../models/Card";
import { Suit } from "../../models/Suit";
import type { ShellCardKind } from "../../models/minigames/ShellGameMinigame";

const shellQueenParams: SpellCardParams = {
    rank: 12,
    suit: Suit.Metal,
    name: "Queen",
    description: "Pick the Queen to win. No other effect.",
    effect: (_combat: Combat) => {},
};

const shellJesterParams: SpellCardParams = {
    rank: 11,
    suit: Suit.Koala,
    name: "Jester",
    description: "The Jester deals 10 damage per act.",
    effect: (_combat: Combat) => {},
};

function spellCardFromParams(params: SpellCardParams): SpellCard {
    return new SpellCard(
        params.rank,
        params.suit,
        params.name,
        params.description,
        params.effect,
        params.charges,
        params.keywords,
        params.flavorText,
        params.castAnimationDirection
    );
}

export function createShellSpellCard(kind: ShellCardKind): SpellCard {
    const card = spellCardFromParams(kind === "queen" ? shellQueenParams : shellJesterParams);
    card.revealed = false;
    return card;
}
