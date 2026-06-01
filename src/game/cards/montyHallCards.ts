import type { Combat } from "../../composables/useCombat";
import { SpellCard, type SpellCardParams } from "../../models/Card";
import { Suit } from "../../models/Suit";
import type { MontyCardKind } from "../../models/minigames/MontyHallMinigame";

const winnerParams: SpellCardParams = {
    rank: 1,
    suit: Suit.Metal,
    name: "Prize",
    description: "The winning card.",
    effect: (_combat: Combat) => {},
};

const loserParams: SpellCardParams = {
    rank: 2,
    suit: Suit.Koala,
    name: "Blank",
    description: "An empty card.",
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

export function createMontyHallSpellCard(kind: MontyCardKind): SpellCard {
    const card = spellCardFromParams(kind === "winner" ? winnerParams : loserParams);
    card.revealed = false;
    return card;
}
