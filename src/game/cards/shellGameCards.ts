import type { Combat } from "../../composables/useCombat";
import { SpellCard, type SpellCardParams } from "../../models/Card";
import { Suit } from "../../models/Suit";
import type { ShellCardKind } from "../../models/minigames/ShellGameMinigame";

const shellRockoParams: SpellCardParams = {
    rank: 12,
    suit: Suit.Koala,
    name: "Rocko",
    description: "A wallaby. Pick Rocko to win.",
    effect: (_combat: Combat) => {},
};

const shellHefferParams: SpellCardParams = {
    rank: 11,
    suit: Suit.Earth,
    name: "Heffer",
    description: "A steer. Wrong pick — 10 damage per act.",
    effect: (_combat: Combat) => {},
};

const shellFilburtParams: SpellCardParams = {
    rank: 10,
    suit: Suit.Water,
    name: "Filburt",
    description: "A turtle. Wrong pick — 10 damage per act.",
    effect: (_combat: Combat) => {},
};

const SHELL_CARD_PARAMS: Record<ShellCardKind, SpellCardParams> = {
    rocko: shellRockoParams,
    heffer: shellHefferParams,
    filburt: shellFilburtParams,
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
    const card = spellCardFromParams(SHELL_CARD_PARAMS[kind]);
    card.revealed = false;
    return card;
}
