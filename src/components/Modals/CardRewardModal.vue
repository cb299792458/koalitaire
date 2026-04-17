<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SingleCard from '../Cards/SingleCard.vue';
import { SpellCard } from '../../models/Card';
import type { SpellCardParams } from '../../models/Card';
import type Player from '../../models/Player';
import { generalCards } from '../../game/cards/generalCards';
import { starterCards } from '../../game/cards/starterCards';

const props = withDefaults(defineProps<{
    /** Modal title (e.g. "Enemy Defeated" or "Event Complete") */
    title?: string;
    /** Player to add reward cards to. Required for card reward UI. */
    player?: Player | null;
    /** Called when Accept is clicked. Return false to prevent closing. */
    onContinue?: () => void | boolean;
}>(), {
    title: 'Card Reward',
});

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const REWARD_POOL = [...generalCards, ...starterCards] as SpellCardParams[];
const REWARD_COUNT = 3;

const displayCards = ref<SpellCard[]>([]);
const rewardParams = ref<SpellCardParams[]>([]);
/** Per reward card: include in combat deck when accepting. */
const includeInDeck = ref<boolean[]>([false, false, false]);

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

function pickRandomCards(count: number): SpellCardParams[] {
    const shuffled = [...REWARD_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

onMounted(() => {
    const params = pickRandomCards(REWARD_COUNT);
    rewardParams.value = params;
    displayCards.value = params.map((p) => {
        const card = createSpellCardFromParams(p);
        card.revealed = true;
        return card;
    });
    includeInDeck.value = params.map(() => false);
});

function accept() {
    if (!props.player) {
        finish();
        return;
    }
    for (let i = 0; i < rewardParams.value.length; i++) {
        const params = rewardParams.value[i];
        if (!params) continue;
        const spellCard = createSpellCardFromParams(params);
        props.player.collection.push(spellCard);
        props.player.spellDeck.push(includeInDeck.value[i] ?? false);
    }
    finish();
}

function finish() {
    if (props.onContinue?.() !== false) {
        emit('close');
    }
}

function toggleIncludeInDeck(index: number) {
    const cur = includeInDeck.value[index];
    includeInDeck.value[index] = !cur;
}
</script>

<template>
    <div class="card-reward-modal">
        <div class="modal-content">
            <h2>{{ title }}</h2>
            <div class="card-rewards">
                <div
                    v-for="(card, index) in displayCards"
                    :key="index"
                    class="card-reward-column"
                >
                    <div
                        class="card-reward-card-hit"
                        role="button"
                        tabindex="0"
                        @click="toggleIncludeInDeck(index)"
                        @keydown.enter.prevent="toggleIncludeInDeck(index)"
                        @keydown.space.prevent="toggleIncludeInDeck(index)"
                    >
                        <SingleCard :card="card" />
                    </div>
                    <label class="deck-checkbox-label">
                        <input
                            v-model="includeInDeck[index]"
                            type="checkbox"
                            class="deck-checkbox"
                        />
                        <span>Add to deck</span>
                    </label>
                </div>
            </div>
            <button type="button" class="accept-button" @click="accept">Accept</button>
        </div>
    </div>
</template>

<style scoped>
.card-reward-modal {
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
    max-width: min(960px, 95vw);
}

h2 {
    margin: 0 0 2rem 0;
    font-size: 2.5rem;
    color: #333;
}

.card-rewards {
    display: flex;
    gap: 1.25rem;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}

.card-reward-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.card-reward-card-hit {
    cursor: pointer;
    border-radius: 8px;
    transition: box-shadow 0.15s;
}

.card-reward-card-hit:focus {
    outline: 2px solid #4caf50;
    outline-offset: 4px;
}

.card-reward-card-hit:focus:not(:focus-visible) {
    outline: none;
}

.card-reward-card-hit:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.deck-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    user-select: none;
}

.deck-checkbox {
    width: 1.1rem;
    height: 1.1rem;
    cursor: pointer;
}

.accept-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    transition: background 0.2s;
    cursor: pointer;
}

.accept-button:hover {
    background: #43a047;
}

.accept-button:active {
    background: #388e3c;
}
</style>
