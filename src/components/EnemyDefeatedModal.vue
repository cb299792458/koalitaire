<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import SingleCard from './SingleCard.vue';
    import { SpellCard } from '../models/Card';
    import type { SpellCardParams } from '../models/Card';
    import type Player from '../models/Player';
    import { generalCards } from '../game/cards/generalCards';
    import { starterCards } from '../game/cards/starterCards';

    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    const props = withDefaults(defineProps<{
        /** Modal title (e.g. "Enemy Defeated" or "Event Complete") */
        title?: string;
        /** Player to add chosen card to. Required for card reward UI. */
        player?: Player | null;
        /** Called when a card is chosen or Skip is clicked. Return false to prevent closing (e.g. when opening another modal). */
        onContinue?: () => void | boolean;
    }>(), {
        title: 'Enemy Defeated',
    });

    const rewardPool = [...generalCards, ...starterCards] as SpellCardParams[];
    const displayCards = ref<SpellCard[]>([]);
    const rewardParams = ref<SpellCardParams[]>([]);

    function pickRandomCards(count: number): SpellCardParams[] {
        const shuffled = [...rewardPool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    function createDisplayCard(params: SpellCardParams): SpellCard {
        const card = new SpellCard(
            params.rank,
            params.suit,
            params.name,
            params.description,
            params.effect,
            params.charges,
            params.keywords,
            params.flavorText
        );
        card.revealed = true;
        return card;
    }

    onMounted(() => {
        const params = pickRandomCards(3);
        rewardParams.value = params;
        displayCards.value = params.map(p => createDisplayCard(p));
    });

    function selectCard(index: number) {
        const p = props.player;
        const params = rewardParams.value[index];
        if (!p || !params) return;
        const spellCard = new SpellCard(
            params.rank,
            params.suit,
            params.name,
            params.description,
            params.effect,
            params.charges,
            params.keywords,
            params.flavorText
        );
        p.collection.push(spellCard);
        p.spellDeck.push(true);
        finish();
    }

    function skip() {
        finish();
    }

    function finish() {
        const result = props.onContinue?.();
        if (result !== false) {
            emit('close');
        }
    }
</script>

<template>
    <div class="enemy-defeated-modal">
        <div class="modal-content">
            <h2>{{ props.title }}</h2>
            <div class="card-rewards">
                <button
                    v-for="(card, index) in displayCards"
                    :key="index"
                    type="button"
                    class="card-reward-slot"
                    @click="selectCard(index)"
                >
                    <SingleCard :card="card" />
                </button>
            </div>
            <button @click="skip" class="skip-button">Skip</button>
        </div>
    </div>
</template>

<style scoped>
    .enemy-defeated-modal {
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
    }

    h2 {
        margin: 0 0 2rem 0;
        font-size: 2.5rem;
        color: #333;
    }

    .card-rewards {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 2rem;
    }

    .card-reward-slot {
        padding: 0;
        border: 3px solid transparent;
        border-radius: 8px;
        background: none;
        cursor: pointer;
        transition: border-color 0.2s, transform 0.15s;
    }

    .card-reward-slot:hover {
        border-color: #4CAF50;
        transform: scale(1.05);
    }

    .card-reward-slot:active {
        transform: scale(0.98);
    }

    .skip-button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        background: #9e9e9e;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .skip-button:hover {
        background: #757575;
    }

    .skip-button:active {
        background: #616161;
    }
</style>
