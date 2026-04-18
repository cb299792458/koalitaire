<script setup lang="ts">
    import { ref, watch, computed, nextTick } from 'vue'
    import type Player from '../../models/Player'
    // import { Suit, Suits } from '../../models/Suit'
    // import { suitIconMap, suitClassMap } from '../../utils/suitAssets'
    import SingleCard from '../Cards/SingleCard.vue'
    import type { ScenarioEntry } from '../../game/makeScenario'
    import { getNextRowOptions } from '../../game/makeScenario'

    const props = defineProps<{
        player: Player
        onContinue: (player: Player, row: number, col: number) => void
        scenario?: ScenarioEntry[][]
    }>()

    function getEntryLabel(entry: NonNullable<ScenarioEntry>): string {
        if ('enemy' in entry) return 'Combat'
        if ('elite' in entry) return 'Elite'
        if ('boss' in entry) return 'Boss'
        if ('town' in entry) return 'Town'
        if ('event' in entry) return 'Event'
        return 'Unknown'
    }

    function getEntryImage(entry: ScenarioEntry): string {
        if (entry === null) return '/scenarios/town.png'
        if ('enemy' in entry) return '/scenarios/enemy.png'
        if ('elite' in entry) return '/scenarios/elite.png'
        if ('boss' in entry) return '/scenarios/boss.png'
        if ('town' in entry) return '/scenarios/town.png'
        if ('event' in entry) return '/scenarios/event.png'
        return '/scenarios/town.png'
    }

    const scenario = computed(() => props.scenario ?? [])

    const nextOptions = computed(() => {
        const options = getNextRowOptions(props.player.scenarioRow, props.player.scenarioColumn)
        return new Set(options.map(({ row, col }) => `${row}-${col}`))
    })

    function isNextOption(row: number, col: number): boolean {
        return nextOptions.value.has(`${row}-${col}`)
    }

    const currentRowRef = ref<HTMLElement | null>(null)

    function setCurrentRowRef(el: unknown, row: number) {
        if (el && row === props.player.scenarioRow) {
            currentRowRef.value = el as HTMLElement
        } else if (!el) {
            currentRowRef.value = null
        }
    }

    function scrollToCurrent() {
        nextTick(() => {
            currentRowRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
    }

    const activeTab = ref<'map' | 'deck'>('map')

    watch([() => activeTab.value, () => props.player.scenarioRow, () => props.player.scenarioColumn], () => {
        if (activeTab.value === 'map') scrollToCurrent()
    }, { immediate: true })

    const emit = defineEmits<{
        (e: 'close'): void
    }>()

    const deckList = ref<boolean[]>([])

    /*
     * ----- Mana deck editing (disabled): uncomment imports above, this block, template "Mana Cards"
     * section, and the Object.assign line in goToEntry to restore. -----
     *
    const manaCards = ref<Record<string, number>>({})

    const manaSuits = Suits

    function setManaCards(suit: Suit, value: number) {
        manaCards.value[suit] = Math.max(0, Math.min(9, value))
    }

    function getManaCards(suit: Suit) {
        return manaCards.value[suit] ?? 0
    }

    function incrementManaCards(suit: Suit) {
        setManaCards(suit, getManaCards(suit) + 1)
    }

    function decrementManaCards(suit: Suit) {
        setManaCards(suit, getManaCards(suit) - 1)
    }
    */

    watch(() => props.player, () => {
        currentRowRef.value = null
    }, { deep: true })

    function goToEntry(row: number, col: number) {
        props.player.spellDeck.length = 0
        props.player.spellDeck.push(...deckList.value)
        // Object.assign(props.player.manaDeck, manaCards.value)
        props.player.scenarioRow = row
        props.player.scenarioColumn = col
        props.player.level = row
        props.onContinue(props.player, row, col)
        emit('close')
    }

    watch(() => props.player, (player) => {
        deckList.value = [...player.spellDeck]
        // manaCards.value = { ...player.manaDeck }
        player.collection.forEach((card) => { card.revealed = true })
    }, { immediate: true })

    function toggleDeckCard(index: number) {
        if (index >= 0 && index < deckList.value.length) {
            deckList.value[index] = !deckList.value[index]
        }
    }

    function addAllCardsToDeck() {
        deckList.value = deckList.value.map(() => true)
    }

    function removeAllCardsFromDeck() {
        deckList.value = deckList.value.map(() => false)
    }
</script>

<template>
    <div class="back-at-camp-modal">
        <div class="modal-content">
            <h2>Meanwhile Back at Camp...</h2>

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
                <div class="diamond-map">
                    <div
                        v-for="(rowEntries, row) in scenario"
                        v-show="row >= props.player.scenarioRow"
                        :key="row"
                        :ref="(el) => setCurrentRowRef(el, row)"
                        class="diamond-row"
                        :class="{ 'diamond-row--first-visible': row === props.player.scenarioRow }"
                        :style="{ zIndex: scenario.length - row }"
                    >
                        <div
                            v-for="(entry, col) in rowEntries"
                            :key="col"
                            class="diamond-card clickable"
                            :class="{
                                'disabled': !isNextOption(row, col),
                                'diamond-card--current': row === props.player.scenarioRow && col === props.player.scenarioColumn,
                            }"
                            @click="isNextOption(row, col) && goToEntry(row, col)"
                        >
                            <div class="diamond-card-artwork">
                                <img :src="getEntryImage(entry)" alt="" class="diamond-card-image" />
                            </div>
                            <span class="diamond-card-label">
                                {{ entry === null ? 'Start' : getEntryLabel(entry) }}
                            </span>
                        </div>
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
                            v-for="(card, index) in props.player.collection"
                            :key="index"
                            class="spell-card-cell clickable"
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

                <!-- Mana deck editing disabled — see script block comment for full markup + logic to restore.
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
                                <img :src="suitIconMap[suit]" :alt="suit" class="mana-suit-icon" :class="suitClassMap[suit] ?? ''" />
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
                -->
            </div>
        </div>
    </div>
</template>

<style scoped>
    .back-at-camp-modal {
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

    .diamond-map {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem 0;
    }

    .diamond-row {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        position: relative;
        margin-top: -50px;
        min-height: 70px;
    }

    .diamond-row:first-child,
    .diamond-row--first-visible {
        margin-top: 0;
    }

    .diamond-card {
        position: relative;
        width: 100px;
        aspect-ratio: 5 / 7;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-end;
        background-color: #f5f0d0;
        border: 1px solid #333;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #333;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        opacity: 1;
    }

    .diamond-card-artwork {
        flex: 1 1 0;
        min-height: 0;
        overflow: hidden;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.08);
    }

    .diamond-card-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }

    .diamond-card--current {
        border-width: 2px;
        border-color: #2E7D32;
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.6), 0 0 12px rgba(76, 175, 80, 0.4);
        transform: scale(1.05);
    }

    .diamond-card:not(.disabled) {
        background-color: #faf5e0;
    }

    .diamond-card:not(.disabled):hover {
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
    }

    .diamond-card-label {
        position: relative;
        text-align: center;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 0.25rem 0.4rem;
        border-radius: 4px;
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

    .map-card:not(.disabled):hover {
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

    .mana-suit-icon.suit-wood { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(2000%) hue-rotate(90deg) brightness(70%) contrast(120%); }
    .mana-suit-icon.suit-fire { filter: brightness(0) saturate(100%) invert(16%) sepia(94%) saturate(7151%) hue-rotate(358deg) brightness(99%) contrast(113%); }
    .mana-suit-icon.suit-water { filter: brightness(0) saturate(100%) invert(48%) sepia(99%) saturate(2476%) hue-rotate(182deg) brightness(95%) contrast(86%); }
    .mana-suit-icon.suit-metal { filter: brightness(0) saturate(0%) invert(50%) grayscale(100%); }
    .mana-suit-icon.suit-earth { filter: brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(1200%) hue-rotate(30deg) brightness(70%) contrast(110%); }
    .mana-suit-icon.suit-koala { filter: brightness(0) saturate(100%) invert(20%) sepia(40%) saturate(800%) hue-rotate(25deg) brightness(60%) contrast(100%); }

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
        transition: background 0.2s;
    }

    .mana-stepper-button:hover:not(:disabled) {
        background: #d0d0d0;
    }

    .mana-stepper-button:disabled {
        opacity: 0.5;
    }

    .mana-value {
        min-width: 1.5rem;
        text-align: center;
        font-weight: 600;
    }
</style>
