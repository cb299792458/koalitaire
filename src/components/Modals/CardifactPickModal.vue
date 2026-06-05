<script setup lang="ts">
    import type Cardifact from '../../models/Cardifact';
    import { pickRandomUnownedStartingCardifactClasses, type StartingCardifactClass } from '../../game/cardifacts/statBuffCardifacts';
    import CardifactAsCard from '../Cards/CardifactAsCard.vue';

    const props = defineProps<{
        /** Called with a fresh cardifact instance; parent adds it to the player. */
        onPick: (cardifact: Cardifact) => void;
    }>();

    const STARTING_CHOICES = 3;
    const pickedClasses: StartingCardifactClass[] = pickRandomUnownedStartingCardifactClasses(
        new Set<string>(),
        STARTING_CHOICES
    );
    /** Previews only (not added to the player until confirmed). */
    const choices = pickedClasses.map((Cls) => new Cls());

    function pick(index: number) {
        const Ctor = pickedClasses[index];
        if (!Ctor) return;
        props.onPick(new Ctor());
    }

    function onChoiceKeydown(e: KeyboardEvent, index: number) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pick(index);
        }
    }
</script>

<template>
    <div class="cardifact-pick-modal">
        <h2>Choose a cardifact</h2>
        <p class="cardifact-pick-modal__hint">A family heirloom, it's effects will be applied to you at the start of each combat.</p>
        <div class="cardifact-pick-modal__grid">
            <div
                v-for="(c, index) in choices"
                :key="c.id"
                role="button"
                tabindex="0"
                class="cardifact-pick-modal__choice"
                :aria-label="`Choose cardifact: ${c.name}`"
                @click="pick(index)"
                @keydown="onChoiceKeydown($event, index)"
            >
                <CardifactAsCard :cardifact="c" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.cardifact-pick-modal {
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

.cardifact-pick-modal__hint {
    margin: 0;
    color: #444;
    font-size: 0.95rem;
}

.cardifact-pick-modal__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: center;
    align-items: flex-start;
}

.cardifact-pick-modal__choice {
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

.cardifact-pick-modal__choice:hover {
    transform: scale(1.04);
}

.cardifact-pick-modal__choice:focus-visible {
    outline: 2px solid #4caf50;
    outline-offset: 4px;
}

.cardifact-pick-modal__choice :deep(.card-view) {
    margin: 0;
}
</style>
