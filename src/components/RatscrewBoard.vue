<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useRatscrew } from "../composables/useRatscrew";
import { useMinigame } from "../composables/useMinigame";
import {
    isRatscrewMinigame,
    RATSCREW_FALSE_SLAP_DAMAGE_BASE,
    RATSCREW_CREW_LABEL,
    RATSCREW_MISS_DAMAGE_BASE,
} from "../models/minigames/RatscrewMinigame";
import type Card from "../models/Card";
import {
    combatPileCardStyle,
    combatPileInFlightZIndex,
} from "../game/combatPileStack";

const { session, beginPlay, slap } = useRatscrew();
const { currentMinigame } = useMinigame();

const ratscrewMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg && isRatscrewMinigame(mg) ? mg : null;
});

const isIntro = computed(() => session.value?.phase === "intro");

const deckTop = computed((): Card | null => {
    const shoe = session.value?.shoe;
    return shoe && shoe.length > 0 ? shoe[0]! : null;
});

const deckCount = computed(() => session.value?.shoe.length ?? 0);

const inFlightRevealed = computed(() => {
    const stage = session.value?.inFlightStage;
    return stage === "revealed-at-deck" || stage === "moving";
});

const inFlightMoving = computed(
    () => session.value?.inFlightStage === "moving"
);

/** Above the face-up pile while a card is flipping or sliding over. */
const inFlightZIndex = computed(() => {
    const pileLength = session.value?.pile.length ?? 0;
    return combatPileInFlightZIndex(pileLength);
});

const missDamage = computed(() => {
    const mg = ratscrewMinigame.value;
    return mg ? mg.damageForAct(RATSCREW_MISS_DAMAGE_BASE) : RATSCREW_MISS_DAMAGE_BASE;
});

const falseSlapDamage = computed(() => {
    const mg = ratscrewMinigame.value;
    return mg ? mg.damageForAct(RATSCREW_FALSE_SLAP_DAMAGE_BASE) : RATSCREW_FALSE_SLAP_DAMAGE_BASE;
});

const DECK_STACK_LAYERS = 3;

function deckLayerStyle(layer: number) {
    return combatPileCardStyle(layer, DECK_STACK_LAYERS);
}

function pileCardStyle(index: number, cardCount: number) {
    return combatPileCardStyle(index, cardCount);
}
</script>

<template>
    <div v-if="session && ratscrewMinigame" class="ratscrew-tableau">
        <p class="ratscrew-tableau__host">{{ RATSCREW_CREW_LABEL }}</p>

        <div v-if="isIntro" class="ratscrew-tableau__intro">
            <p class="ratscrew-tableau__intro-lead">
                A crew of pirate rats flips your combat deck one card at a time onto the pile.
                Slap when you spot a pattern — but not before they've turned it face-up!
            </p>
            <ul class="ratscrew-tableau__rules">
                <li>
                    <strong>Double</strong> — same rank twice in a row (e.g. 7, 7)
                </li>
                <li>
                    <strong>Sandwich</strong> — same rank with one card between (e.g. 7, K, 7)
                </li>
                <li>
                    <strong>Double sandwich</strong> — same rank with two between (e.g. 7, K, Q, 7)
                </li>
                <li>Miss a pattern — <strong>{{ missDamage }} damage</strong></li>
                <li>Slap with no pattern — <strong>{{ falseSlapDamage }} damage</strong></li>
                <li>Survive until every card is flipped to win</li>
            </ul>
            <button type="button" class="ratscrew-tableau__start" @click="beginPlay()">
                Start
            </button>
        </div>

        <template v-else>
            <p class="ratscrew-tableau__meta">
                Flipped: {{ session.cardsFlipped }} / {{ session.cardsTotal }}
                · Slaps: {{ session.correctSlaps }}
                · Misses: {{ session.misses }}
                · Bad slaps: {{ session.falseSlaps }}
            </p>

            <p class="ratscrew-tableau__status">
                {{ session.roundMessage }}
            </p>
        </template>

        <div class="ratscrew-tableau__arena">
            <div
                class="ratscrew-tableau__side ratscrew-tableau__side--deck"
                :class="{ 'ratscrew-tableau__side--elevated': session.inFlightCard }"
            >
                <p class="ratscrew-tableau__label">Your deck</p>
                <div class="ratscrew-tableau__deck">
                    <div
                        v-for="layer in 3"
                        :key="`deck-stack-${layer}`"
                        class="ratscrew-tableau__deck-layer"
                        :class="{
                            'ratscrew-tableau__deck-layer--hidden':
                                layer === 1 && session.inFlightCard,
                        }"
                        :style="deckLayerStyle(layer - 1)"
                    >
                        <SingleCard
                            v-if="deckTop && !(layer === 1 && session.inFlightCard)"
                            :card="deckTop"
                            :display-as-revealed="false"
                        />
                    </div>
                    <div
                        v-if="session.inFlightCard"
                        class="ratscrew-flying"
                        :class="{
                            'ratscrew-flying--revealed': inFlightRevealed,
                            'ratscrew-flying--moving': inFlightMoving,
                        }"
                        :style="{ zIndex: inFlightZIndex }"
                    >
                        <div class="ratscrew-flying__flip">
                            <div class="ratscrew-flying__inner">
                                <div class="ratscrew-flying__back">
                                    <SingleCard
                                        :card="session.inFlightCard"
                                        :display-as-revealed="false"
                                    />
                                </div>
                                <div class="ratscrew-flying__front">
                                    <SingleCard
                                        :card="session.inFlightCard"
                                        :display-as-revealed="true"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="ratscrew-tableau__count">{{ deckCount }} left</p>
            </div>

            <div class="ratscrew-tableau__arrow" aria-hidden="true">→</div>

            <div class="ratscrew-tableau__side ratscrew-tableau__side--pile">
                <p class="ratscrew-tableau__label">Face-up pile</p>
                <div class="ratscrew-tableau__pile-slot">
                    <div
                        v-for="(pileCard, index) in session.pile"
                        v-show="
                            !(
                                session.inFlightCard &&
                                pileCard === session.inFlightCard
                            )
                        "
                        :key="`pile-${index}-${pileCard.rank}-${pileCard.suit}`"
                        class="ratscrew-tableau__pile-card"
                        :style="pileCardStyle(index, session.pile.length)"
                    >
                        <SingleCard
                            :card="pileCard"
                            :display-as-revealed="true"
                        />
                    </div>
                </div>
                <p class="ratscrew-tableau__count">
                    {{ session.pile.length > 0 ? "Top card" : "Empty" }}
                </p>
            </div>
        </div>

        <div v-if="!isIntro" class="ratscrew-tableau__actions">
            <button
                type="button"
                class="ratscrew-tableau__slap ratscrew-tableau__slap--active"
                :disabled="session.phase === 'complete'"
                @click="slap()"
            >
                Slap!
            </button>
        </div>
    </div>
</template>

<style scoped>
.ratscrew-tableau {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 280px;
    padding: 8px 12px;
    overflow: visible;
}

.ratscrew-tableau__host {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1.15rem;
    font-weight: 700;
    color: #5c3d2e;
}

.ratscrew-tableau__intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 520px;
    padding: 0 8px;
}

.ratscrew-tableau__intro-lead,
.ratscrew-tableau__rules {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.95rem;
    line-height: 1.45;
    color: #333;
    text-align: center;
}

.ratscrew-tableau__rules {
    text-align: left;
    padding-left: 1.25rem;
}

.ratscrew-tableau__rules li {
    margin-bottom: 6px;
}

.ratscrew-tableau__start {
    padding: 12px 32px;
    font-family: var(--font-game-mono);
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 6px;
    border: 1px solid #5c3d2e;
    background: #f5e6d3;
    color: #5c3d2e;
    cursor: pointer;
}

.ratscrew-tableau__start:hover {
    background: #edd9c4;
}

.ratscrew-tableau__meta,
.ratscrew-tableau__status,
.ratscrew-tableau__label,
.ratscrew-tableau__count {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: center;
    color: #333;
}

.ratscrew-tableau__label {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #444;
}

.ratscrew-tableau__count {
    font-size: 0.85rem;
    color: #555;
}

.ratscrew-tableau__arena {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 28px;
    width: 100%;
    max-width: 420px;
}

.ratscrew-tableau__side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

.ratscrew-tableau__side--elevated {
    z-index: 50;
}

.ratscrew-tableau__deck {
    position: relative;
    width: 120px;
    height: 168px;
}

.ratscrew-tableau__deck-layer {
    position: absolute;
    top: 0;
    left: 0;
}

.ratscrew-tableau__deck-layer--hidden {
    visibility: hidden;
}

.ratscrew-tableau__pile-slot {
    position: relative;
    width: 120px;
    height: 168px;
    min-height: 168px;
    flex-shrink: 0;
    overflow: visible;
}

.ratscrew-tableau__pile-card {
    width: 120px;
    height: 168px;
}

.ratscrew-flying {
    position: absolute;
    top: 0;
    left: 0;
    width: 120px;
    height: 168px;
    transition: transform 0.45s cubic-bezier(0.34, 1.1, 0.64, 1);
    transform: translateX(0);
    will-change: transform, z-index;
}

.ratscrew-flying--moving {
    /* deck width + arena gap + arrow */
    transform: translateX(calc(120px + 28px + 2rem));
}

.ratscrew-flying__flip {
    width: 100%;
    height: 100%;
    perspective: 1000px;
}

.ratscrew-flying__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
    transform: rotateY(0deg);
}

.ratscrew-flying--revealed .ratscrew-flying__inner {
    transform: rotateY(180deg);
}

.ratscrew-flying__back,
.ratscrew-flying__front {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 10px;
}

.ratscrew-flying__front {
    transform: rotateY(180deg);
}

.ratscrew-flying__back :deep(.card-view),
.ratscrew-flying__front :deep(.card-view) {
    margin: 0;
    width: 120px;
    height: 168px;
    min-height: 168px;
    aspect-ratio: auto;
}

.ratscrew-flying__front :deep(.card-view .card-back) {
    display: none;
}

.ratscrew-tableau__deck-layer :deep(.card-view),
.ratscrew-tableau__pile-card :deep(.card-view) {
    margin: 0;
}

.ratscrew-tableau__arrow {
    font-family: var(--font-game-mono);
    font-size: 2rem;
    color: #555;
    flex-shrink: 0;
    padding-top: 20px;
}

.ratscrew-tableau__actions {
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ratscrew-tableau__slap {
    padding: 14px 36px;
    font-family: var(--font-game-mono);
    font-size: 1.2rem;
    font-weight: 700;
    border-radius: 8px;
    border: 2px solid #666;
    background: #f4f4f4;
    color: #333;
    cursor: pointer;
}

.ratscrew-tableau__slap:disabled {
    border-color: #888;
    background: #e8e8e8;
    color: #666;
    cursor: not-allowed;
}

.ratscrew-tableau__slap--active:hover:not(:disabled) {
    background: #e8e8e8;
}
</style>
