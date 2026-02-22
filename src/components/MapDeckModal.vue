<script setup lang="ts">
    import { ref, watch, computed } from 'vue';
    import type Player from '../models/Player';
    import { Suit, Suits } from '../models/Card';
    import SingleCard from './SingleCard.vue';
    import type { ScenarioEntry } from '../game/makeScenario';

    const props = defineProps<{
        player: Player;
        onContinue: () => void;
        scenario?: ScenarioEntry[];
    }>();

    function getEntryLabel(entry: NonNullable<ScenarioEntry>): string {
        if ('enemy' in entry) return 'Combat';
        if ('elite' in entry) return 'Elite';
        if ('boss' in entry) return 'Boss';
        if ('town' in entry) return 'Town';
        if ('event' in entry) return 'Event';
        return 'Unknown';
    }

    const mapEntries = computed(() => {
        const scenario = props.scenario ?? [];
        return scenario
            .map((entry, index) => ({ entry, index }))
            .filter((x): x is { entry: NonNullable<ScenarioEntry>; index: number } => x.entry !== null && x.index >= props.player.level);
    });

    function goToEntry(index: number) {
        props.player.deckList.length = 0;
        props.player.deckList.push(...deckList.value);
        Object.assign(props.player.manaCards, manaCards.value);
        props.player.level = index;
        props.onContinue();
        emit('close');
    }

    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    const activeTab = ref<'map' | 'deck'>('map');

    // Reactive copies for Vue reactivity; synced back to player on Continue
    const deckList = ref<boolean[]>([]);
    const manaCards = ref<Record<string, number>>({});

    watch(() => props.player, (player) => {
        deckList.value = [...player.deckList];
        manaCards.value = { ...player.manaCards };
        player.allCards.forEach(card => { card.revealed = true; });
    }, { immediate: true });

    const suitIconMap: Record<Suit, string> = {
        [Suit.Wood]: '/icons/tree-svgrepo-com.svg',
        [Suit.Fire]: '/icons/fire-svgrepo-com.svg',
        [Suit.Earth]: '/icons/rock-svgrepo-com.svg',
        [Suit.Metal]: '/icons/metal-bar-svgrepo-com.svg',
        [Suit.Water]: '/icons/water-drop-svgrepo-com.svg',
        [Suit.Koala]: '/icons/koala.svg',
    };

    function suitClass(suit: Suit): string {
        if (suit === Suit.Wood) return 'suit-wood';
        if (suit === Suit.Fire) return 'suit-fire';
        if (suit === Suit.Water) return 'suit-water';
        if (suit === Suit.Earth) return 'suit-earth';
        if (suit === Suit.Metal) return 'suit-metal';
        if (suit === Suit.Koala) return 'suit-koala';
        return '';
    }

    const manaSuits = Suits;

    function toggleDeckCard(index: number) {
        if (index >= 0 && index < deckList.value.length) {
            deckList.value[index] = !deckList.value[index];
        }
    }

    function addAllCardsToDeck() {
        deckList.value = deckList.value.map(() => true);
    }

    function removeAllCardsFromDeck() {
        deckList.value = deckList.value.map(() => false);
    }

    function setManaCards(suit: Suit, value: number) {
        manaCards.value[suit] = Math.max(0, Math.min(9, value));
    }

    function getManaCards(suit: Suit): number {
        return manaCards.value[suit] ?? 0;
    }

    function incrementManaCards(suit: Suit) {
        setManaCards(suit, getManaCards(suit) + 1);
    }

    function decrementManaCards(suit: Suit) {
        setManaCards(suit, getManaCards(suit) - 1);
    }

</script>

<template>
    <div class="map-deck-modal">
        <div class="modal-content">
            <h2>Back at Camp</h2>

            <div class="tabs">
                <button
                    type="button"
                    class="tab"
                    :class="{ active: activeTab === 'map' }"
                    @click="activeTab = 'map'"
                >
                    Map
                </button>
                <button
                    type="button"
                    class="tab"
                    :class="{ active: activeTab === 'deck' }"
                    @click="activeTab = 'deck'"
                >
                    Deck
                </button>
            </div>

            <div v-if="activeTab === 'map'" class="tab-content map-content">
                <div
                    class="map-stack"
                    :style="{ minHeight: `${168 + Math.max(0, mapEntries.length - 1) * 20}px` }"
                >
                    <div
                        v-for="(item, stackIndex) in mapEntries"
                        :key="item.index"
                        class="map-card"
                        :style="{
                            top: `${(mapEntries.length - 1 - stackIndex) * 20}px`,
                            zIndex: mapEntries.length - stackIndex,
                            pointerEvents: stackIndex === 0 ? 'auto' : 'none',
                        }"
                        :class="{ 'map-card--clickable': stackIndex === 0 }"
                        @click="stackIndex === 0 && goToEntry(item.index)"
                    >
                        <span class="map-card-label">{{ getEntryLabel(item.entry) }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="tab-content deck-content">
                <section class="deck-section">
                    <h3>Spell Cards</h3>
                    <div class="deck-section-header">
                        <p class="deck-hint">Prepare your spells for the next combat.</p>
                        <div class="deck-bulk-buttons">
                            <button type="button" class="deck-bulk-button" @click="addAllCardsToDeck">
                                Add all spells to deck
                            </button>
                            <button type="button" class="deck-bulk-button" @click="removeAllCardsFromDeck">
                                Remove all spells from deck
                            </button>
                        </div>
                    </div>
                    <div class="spell-cards-grid">
                        <label
                            v-for="(card, index) in props.player.allCards"
                            :key="index"
                            class="spell-card-cell"
                        >
                            <div class="spell-card-preview">
                                <SingleCard :card="card" />
                                <input
                                    v-show="deckList[index]"
                                    type="checkbox"
                                    class="deck-checkbox-input"
                                    :checked="deckList[index]"
                                    @change="toggleDeckCard(index)"
                                />
                            </div>
                        </label>
                    </div>
                </section>

                <section class="mana-section">
                    <h3>Mana Cards</h3>
                    <p class="deck-hint">Choose how many mana cards to bring to combat.</p>
                    <div class="mana-controls">
                        <div
                            v-for="suit in manaSuits"
                            :key="suit"
                            class="mana-control-row"
                        >
                            <div class="mana-label">
                                <img :src="suitIconMap[suit]" :alt="suit" class="mana-suit-icon" :class="suitClass(suit)" />
                            </div>
                            <div class="mana-stepper">
                                <button
                                    type="button"
                                    class="mana-stepper-button"
                                    :disabled="getManaCards(suit) <= 0"
                                    @click="decrementManaCards(suit)"
                                >
                                    −
                                </button>
                                <span class="mana-value">{{ getManaCards(suit) }}</span>
                                <button
                                    type="button"
                                    class="mana-stepper-button"
                                    :disabled="getManaCards(suit) >= 9"
                                    @click="incrementManaCards(suit)"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .map-deck-modal {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: white;
    }

    .modal-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        overflow: auto;
        gap: 1rem;
        min-height: 0;
    }

    h2 {
        margin: 0;
        font-size: 1.75rem;
        color: #333;
    }

    .tabs {
        display: flex;
        gap: 0.5rem;
    }

    .tab {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background: #e0e0e0;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .tab:hover {
        background: #d0d0d0;
    }

    .tab.active {
        background: #4CAF50;
        color: white;
    }

    .tab-content {
        flex: 1;
        min-height: 200px;
    }

    .map-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
    }

    .map-stack {
        position: relative;
        width: 120px;
        min-height: 300px;
        flex-shrink: 0;
    }

    .map-card {
        position: absolute;
        left: 0;
        width: 120px;
        aspect-ratio: 5 / 7;
        background-color: #f5f0d0;
        border: 1px solid #333;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        font-weight: bold;
        font-size: 0.9rem;
        color: #333;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        box-sizing: border-box;
    }

    .map-card--clickable {
        cursor: pointer;
    }

    .map-card--clickable:hover {
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
    }

    .map-card-label {
        flex-shrink: 0;
        padding: 6px 8px;
        text-align: center;
        font-size: 10px;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .deck-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        gap: 1.5rem;
    }

    .deck-section {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    .deck-section h3,
    .mana-section h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
    }

    .deck-section-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
    }

    .deck-hint {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
    }

    .deck-bulk-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .deck-bulk-button {
        padding: 0.35rem 0.75rem;
        font-size: 0.85rem;
        background: #e0e0e0;
        color: #333;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .deck-bulk-button:hover {
        background: #d0d0d0;
    }

    .spell-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        grid-auto-rows: min-content;
        align-items: start;
        column-gap: 0.5rem;
        row-gap: 0.25rem;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    .spell-card-cell {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        cursor: pointer;
    }

    .spell-card-preview {
        position: relative;
        width: 120px;
        aspect-ratio: 5 / 7;
        flex-shrink: 0;
    }

    .spell-card-preview :deep(.card-view) {
        margin: 0;
    }

    .deck-checkbox-input {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        z-index: 1;
    }

    .mana-controls {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .mana-control-row {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .mana-label {
        min-width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .mana-suit-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }

    .mana-stepper {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .mana-stepper-button {
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1;
        background: #e0e0e0;
        color: #333;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .mana-stepper-button:hover:not(:disabled) {
        background: #d0d0d0;
    }

    .mana-stepper-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .mana-value {
        min-width: 1.5rem;
        text-align: center;
        font-weight: 600;
    }
</style>
