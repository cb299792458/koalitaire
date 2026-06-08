<script setup lang="ts">
import { ref, computed } from 'vue';
import type Player from '../../models/Player';
import {
    pickRandomUnownedStartingCardifactClasses,
    type StartingCardifactClass,
} from '../../game/cardifacts/statBuffCardifacts';
import type Cardifact from '../../models/Cardifact';
import CardifactAsCard from '../Cards/CardifactAsCard.vue';

const props = withDefaults(
    defineProps<{
        title?: string;
        player?: Player | null;
        onContinue?: () => void | boolean;
    }>(),
    {
        title: 'Elite defeated',
    }
);

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const RELIC_CHOICES = 3;

const slotsFull = computed(() => (props.player?.remainingCardifactSlots ?? 0) <= 0);

function rollRelicChoices(): { classes: StartingCardifactClass[]; previews: Cardifact[] } {
    const p = props.player;
    if (!p || p.remainingCardifactSlots <= 0) {
        return { classes: [], previews: [] };
    }
    const owned = new Set(p.cardifacts.map((c) => c.id));
    const classes = pickRandomUnownedStartingCardifactClasses(owned, RELIC_CHOICES);
    return {
        classes,
        previews: classes.map((Cls) => new Cls()),
    };
}

const rolled = rollRelicChoices();
const pickedClassesRef = ref<StartingCardifactClass[]>(rolled.classes);
const displayRelicsRef = ref<Cardifact[]>(rolled.previews);

function takeRelic(index: number) {
    if (!props.player || slotsFull.value) return;
    const Ctor = pickedClassesRef.value[index];
    if (!Ctor) return;
    props.player.addCardifact(new Ctor());
    finish();
}

function finish() {
    if (props.onContinue?.() !== false) {
        emit('close');
    }
}

function onChoiceKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        takeRelic(index);
    }
}
</script>

<template>
    <div class="elite-relic-reward-modal">
        <div class="modal-content">
            <h2>{{ title }}</h2>

            <template v-if="slotsFull">
                <p class="elite-relic-reward-modal__message">
                    Your relic slots are full. You cannot take another relic.
                </p>
                <button type="button" class="continue-button primary-action-button" @click="finish">Continue</button>
            </template>

            <template v-else-if="displayRelicsRef.length === 0">
                <p class="elite-relic-reward-modal__message">
                    You already carry every relic from this path.
                </p>
                <button type="button" class="continue-button primary-action-button" @click="finish">Continue</button>
            </template>

            <template v-else>
                <p class="elite-relic-reward-modal__hint">Choose one relic.</p>
                <div class="elite-relic-reward-modal__grid">
                    <div
                        v-for="(relic, index) in displayRelicsRef"
                        :key="relic.id"
                        role="button"
                        tabindex="0"
                        class="elite-relic-reward-modal__choice"
                        :aria-label="`Take relic: ${relic.name}`"
                        @click="takeRelic(index)"
                        @keydown="onChoiceKeydown($event, index)"
                    >
                        <CardifactAsCard :cardifact="relic" />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.elite-relic-reward-modal {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 3rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    min-width: 400px;
    max-width: min(720px, 95vw);
    max-height: 85vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

h2 {
    margin: 0;
    font-size: 2.5rem;
    color: #333;
}

.elite-relic-reward-modal__hint {
    margin: 0;
    color: #444;
    font-size: 0.95rem;
}

.elite-relic-reward-modal__message {
    margin: 0;
    color: #333;
    font-size: 1.05rem;
    line-height: 1.45;
}

.elite-relic-reward-modal__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: center;
    align-items: flex-start;
}

.elite-relic-reward-modal__choice {
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

.elite-relic-reward-modal__choice:hover {
    transform: scale(1.04);
}

.elite-relic-reward-modal__choice:focus-visible {
    outline: 2px solid #4caf50;
    outline-offset: 4px;
}

.elite-relic-reward-modal__choice :deep(.card-view) {
    margin: 0;
}

.continue-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    align-self: center;
}
</style>
