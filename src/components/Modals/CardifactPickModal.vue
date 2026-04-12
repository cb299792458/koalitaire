<script setup lang="ts">
    import type Cardifact from '../../models/Cardifact';
    import { ALL_STARTING_CARDIFACT_CLASSES } from '../../game/cardifacts/statBuffCardifacts';

    const props = defineProps<{
        /** Called with a fresh cardifact instance; parent adds it to the player. */
        onPick: (cardifact: Cardifact) => void;
    }>();

    /** Labels only (not added to the player until confirmed). */
    const choices = ALL_STARTING_CARDIFACT_CLASSES.map((Cls) => new Cls());

    function pick(index: number) {
        const Ctor = ALL_STARTING_CARDIFACT_CLASSES[index];
        if (!Ctor) return;
        props.onPick(new Ctor());
    }
</script>

<template>
    <div class="cardifact-pick-modal">
        <h2>Choose a cardifact</h2>
        <p class="cardifact-pick-modal__hint">One blessing for your run.</p>
        <div class="cardifact-pick-modal__grid">
            <button
                v-for="(c, index) in choices"
                :key="c.id"
                type="button"
                class="cardifact-pick-modal__item"
                @click="pick(index)"
            >
                <span class="cardifact-pick-modal__name">{{ c.name }}</span>
                <span class="cardifact-pick-modal__desc">{{ c.description }}</span>
            </button>
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}

.cardifact-pick-modal__item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 0.35rem;
    padding: 0.85rem 1rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    background: #fafafa;
    cursor: pointer;
    font: inherit;
    transition: background 0.15s, border-color 0.15s;
}

.cardifact-pick-modal__item:hover {
    background: #f0f0f0;
    border-color: #888;
}

.cardifact-pick-modal__name {
    font-weight: 600;
}

.cardifact-pick-modal__desc {
    font-size: 0.88rem;
    color: #333;
    line-height: 1.35;
}
</style>
