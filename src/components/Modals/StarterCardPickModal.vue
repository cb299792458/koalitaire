<script setup lang="ts">
import { ref } from 'vue';
import SingleCard from '../Cards/SingleCard.vue';
import { SpellCard, type SpellCardParams } from '../../models/Card';
import type Player from '../../models/Player';
import { pickRandomStarterCardChoices } from '../../game/cards/basicCards';

const props = defineProps<{
    player: Player;
    /** Called after the chosen spell is added to the player's collection and deck. */
    onPick: () => void;
}>();

const STARTING_CHOICES = 3;

const pickedParams = pickRandomStarterCardChoices(STARTING_CHOICES);
const choices = ref(
    pickedParams.map((params) => {
        const card = new SpellCard(
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
        card.revealed = true;
        return card;
    })
);

function createSpellCardFromParams(params: SpellCardParams): SpellCard {
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

function pick(index: number) {
    const params = pickedParams[index];
    if (!params) return;

    props.player.collection.push(createSpellCardFromParams(params));
    props.player.spellDeck.push(true);
    props.onPick();
}

function onChoiceKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick(index);
    }
}
</script>

<template>
    <div class="starter-card-pick-modal">
        <h2>Choose a starter spell</h2>
        <p class="starter-card-pick-modal__hint">Each requires 1 mana of the corresponding suit to be recycled from your mana pool in order to cast.</p>
        <div class="starter-card-pick-modal__grid">
            <div
                v-for="(card, index) in choices"
                :key="`${card.name}-${card.suit}-${index}`"
                role="button"
                tabindex="0"
                class="starter-card-pick-modal__choice"
                :aria-label="`Choose spell: ${card.name}`"
                @click="pick(index)"
                @keydown="onChoiceKeydown($event, index)"
            >
                <SingleCard :card="card" :display-as-revealed="true" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.starter-card-pick-modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: min(720px, 92vw);
    max-height: 85vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.starter-card-pick-modal__hint {
    margin: 0;
    color: #444;
    font-size: 0.95rem;
}

.starter-card-pick-modal__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: center;
    align-items: flex-start;
}

.starter-card-pick-modal__choice {
    display: block;
    border: none;
    background: transparent;
    padding: 0.35rem;
    border-radius: 12px;
    cursor: pointer;
    font: inherit;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    outline: none;
}

.starter-card-pick-modal__choice:hover {
    transform: scale(1.04);
}

.starter-card-pick-modal__choice:focus-visible {
    outline: 2px solid #4caf50;
    outline-offset: 4px;
}

.starter-card-pick-modal__choice :deep(.card-view) {
    margin: 0;
}
</style>
