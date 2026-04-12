<script setup lang="ts">
import { ref, computed } from 'vue';
import type Player from '../../models/Player';
import {
    pickRandomUnownedStartingCardifactClasses,
    type StartingCardifactClass,
} from '../../game/cardifacts/statBuffCardifacts';
import type Cardifact from '../../models/Cardifact';

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
</script>

<template>
    <div class="elite-relic-reward-modal">
        <div class="modal-content">
            <h2>{{ title }}</h2>

            <template v-if="slotsFull">
                <p class="elite-relic-reward-modal__message">
                    Your relic slots are full. You cannot take another relic.
                </p>
                <button type="button" class="continue-button" @click="finish">Continue</button>
            </template>

            <template v-else-if="displayRelicsRef.length === 0">
                <p class="elite-relic-reward-modal__message">
                    You already carry every relic from this path.
                </p>
                <button type="button" class="continue-button" @click="finish">Continue</button>
            </template>

            <template v-else>
                <p class="elite-relic-reward-modal__hint">Choose one relic.</p>
                <div class="elite-relic-reward-modal__grid">
                    <button
                        v-for="(relic, index) in displayRelicsRef"
                        :key="relic.id"
                        type="button"
                        class="elite-relic-reward-modal__item"
                        @click="takeRelic(index)"
                    >
                        <span class="elite-relic-reward-modal__name">{{ relic.name }}</span>
                        <span class="elite-relic-reward-modal__desc">{{ relic.description }}</span>
                    </button>
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}

.elite-relic-reward-modal__item {
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

.elite-relic-reward-modal__item:hover {
    background: #f0f0f0;
    border-color: #888;
}

.elite-relic-reward-modal__name {
    font-weight: 600;
}

.elite-relic-reward-modal__desc {
    font-size: 0.88rem;
    color: #333;
    line-height: 1.35;
}

.continue-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    align-self: center;
}

.continue-button:hover {
    background: #43a047;
}
</style>
