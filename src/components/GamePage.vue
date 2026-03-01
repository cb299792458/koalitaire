<script setup lang="ts">
    import Card from '../models/Card'
    import { Suits } from '../models/Suit'
    import CardStack from './Cards/CardStack.vue'
    import { useCombat } from '../composables/useCombat'
    import { AREAS, type Area } from '../models/Areas'
    import ModalManager from './ModalManager.vue'
    import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
    import { openModal, closeModal, useModalState, openMessageModal } from '../stores/modalStore'
    import CombatantInfo from './CombatantInfo.vue'
    import Enemy from '../models/Enemy'
    import makeScenario, { getNextRowOptions, type ScenarioEntry } from '../game/makeScenario'
    import type Player from '../models/Player'
    import ManaPool from '../models/ManaPool'
    import { useTown } from '../composables/useTown'
    import { useEvent } from '../composables/useEvent'
    import { hasChosenCharacterRef } from '../composables/useCombat'
    import EventView from './EventView.vue'
    import GameLayout from './GameLayout.vue'

    const scenario = makeScenario()
    const modalState = useModalState()
    const town = useTown()
    const eventState = useEvent()
    const combat = useCombat()

    combat.onEnemyDefeated = () => {}
    
    function openMapDeckForPlayer(p: Player, keepOpen = true) {
        const nextOptions = getNextRowOptions(p.scenarioRow, p.scenarioColumn)
        if (nextOptions.length === 0) {
            openMessageModal('You Win!')
            return
        }
        openModal('backAtCamp', {
            player: p,
            scenario,
            onContinue: (player: Player, row: number, col: number) => {
                closeModal()
                startCombatForPlayer(player, row, col)
            },
        }, keepOpen)
    }

    combat.onEnemyDefeatedContinue = () => {
        closeModal()
        const p = combat.originalPlayer ?? combat.player
        if (p) openMapDeckForPlayer(p)
    }
    const player = computed(() =>
        isInEvent.value ? eventState.player.value : combat.player
    )
    const enemy = computed(() => combat.enemy)

    const deck = combat.deck
    const compost = combat.compost
    const trash = combat.trash
    const hand = combat.hand
    const tableau = computed(() => combat.tableau.getCardsArrays())
    const manaPools = combat.manaPools
    const selectedCard = computed(() => combat.selectedCard)

    const allManaPoolCounts = computed(() =>
        Object.values(combat.manaPools).map((pool) => pool.cards.length)
    )
    const canMoveToManaPools = computed(
        () => combat.getCardsMovableToManaPools().length > 0
    )

    const isInEvent = computed(() => eventState.isInEvent.value)
    const isBackAtCampOpen = computed(() => modalState.currentModal?.name === 'backAtCamp')
    const isInCombat = computed(() => !isInEvent.value && !isBackAtCampOpen.value)
    const eventPlayerRoll = computed(() => eventState.lastPlayerRoll.value)
    const eventEventRoll = computed(() => eventState.lastEventRoll.value)
    const eventStatBonus = computed(() => eventState.lastStatBonus.value)
    const eventStat = computed(() => eventState.lastStat.value)
    const eventResultMessage = computed(() => eventState.resultMessage.value)
    const eventIsResolving = computed(() => eventState.isResolving.value)

    watch(eventResultMessage, (msg) => {
        if (msg && isInEvent.value) {
            const p = combat.originalPlayer ?? eventState.player.value ?? combat.player
            openModal('cardReward', {
                title: 'Event Complete',
                player: p,
                onContinue: () => {
                    eventState.onEventContinue()
                    return false
                },
            }, true, true)
        }
    })

    const deckCount = computed(() => combat.deck.cards.length)
    const reshuffles = computed(() => combat.reshuffles)
    const compostCount = computed(() => combat.compost.cards.length)
    const hasTrashCards = computed(() => combat.trash.cards.length > 0)
    const trashCount = computed(() => combat.trash.cards.length)
    
    const isCompostHighlighted = computed(() => {
        const card = selectedCard.value
        return (card?.revealed && combat.isSelectedCardPlayable()) ?? false
    })

    const manaDiamondsCost = computed(() => {
        const cost = combat.getManaDiamondsNeededForCast()
        return cost > 0 && combat.isSelectedCardPlayable() ? cost : null
    })

    const compostHighlightType = computed(() =>
        combat.getManaDiamondsNeededForCast() === 0 ? 'burn' : 'cast'
    )

    const showCastSpellText = computed(() => {
        const card = selectedCard.value
        return (card?.revealed && combat.isSelectedCardPlayable()) ?? false
    })
    
    const highlightedManaPoolIndex = computed(() => {
        const card = selectedCard.value
        if (!card || !card.revealed || card.isSpell) return -1

        const { rank, suit } = card
        const manaPool = combat.manaPools[suit]
        if (!manaPool || manaPool.cards.length !== rank - 1) return -1

        void allManaPoolCounts.value

        const handIndex = combat.hand.cards.indexOf(card)
        if (handIndex === -1) {
            const columns = combat.tableau.getColumns()
            const isLastInTableau = columns.some(
                (col) => col.cards.length > 0 && col.cards[col.cards.length - 1] === card
            )
            if (!isLastInTableau) return -1
        }

        return Suits.indexOf(suit)
    })

    const highlightedTableauIndices = computed(() => {
        void tableau.value
        return combat.canPlaceSelectedCardInTableau()
    })
    
    async function startCombatForPlayer(newPlayer: Player, overrideRow?: number, overrideCol?: number) {
        const rowIdx = overrideRow ?? newPlayer.scenarioRow
        const colIdx = overrideCol ?? newPlayer.scenarioColumn
        const row = scenario[rowIdx]
        const entry = row?.[colIdx] as ScenarioEntry | undefined
        if (!entry) return

        if ('town' in entry && entry.town) {
            eventState.resetEventState()
            town.enterTown(newPlayer)
            return
        }
        if ('event' in entry && entry.event) {
            eventState.enterEvent(newPlayer, entry.event)
            return
        }
        if ('elite' in entry && entry.elite) {
            eventState.resetEventState()
            await combat.start(newPlayer, new Enemy(entry.elite))
            return
        }
        if ('boss' in entry && entry.boss) {
            eventState.resetEventState()
            await combat.start(newPlayer, new Enemy(entry.boss))
            return
        }
        if ('enemy' in entry && entry.enemy) {
            eventState.resetEventState()
            await combat.start(newPlayer, new Enemy(entry.enemy))
        }
    }
    
        
    function onClick(payload: {
        card: Card | null
        area: Area
        arrayIndex?: number
        cardIndex: number
    }) {
        const { card, area, arrayIndex, cardIndex } = payload
        combat.updateGameState(card, area, arrayIndex, cardIndex)
    }

    function onMoveToManaClick() {
        combat.moveAllPossibleToManaPools()
    }

    const scale = ref(0.8)
    const DESIGN_WIDTH = 1920
    const DESIGN_HEIGHT = 1080

    function updateScale() {
        scale.value = Math.min(
            window.innerWidth / DESIGN_WIDTH,
            window.innerHeight / DESIGN_HEIGHT
        )
    }

    onMounted(() => {
        eventState.onLeaveEvent(() => {
            const p = eventState.player.value ?? combat.originalPlayer ?? combat.player
            if (p) openMapDeckForPlayer(p)
        })
        town.onLeaveTown(() => {
            const p = town.player.value ?? combat.originalPlayer ?? combat.player
            if (p) openMapDeckForPlayer(p)
        })
        if (!hasChosenCharacterRef.value) {
            openModal('start', {
                onSelect: (newPlayer: Player) => {
                    hasChosenCharacterRef.value = true
                    openMapDeckForPlayer(newPlayer)
                    return false
                },
            }, true)
        }
        updateScale()
        window.addEventListener('resize', updateScale)
        window.addEventListener('focus', updateScale)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateScale)
        window.removeEventListener('focus', updateScale)
    })
</script>

<template>
    <div class="game-page">
        <div class="scale-wrapper">
            <div class="scale-container" :style="{ transform: `scale(${scale})` }">
                <ModalManager/>
        
                <div
                    v-if="!isBackAtCampOpen"
                    class="game-screen"
                    @click="onClick({ card: null, area: AREAS.Board, cardIndex: -1 })"
                >
                    <GameLayout>
                        <template #left>
                            <h1>Player</h1>
                            <CombatantInfo :combatant="player" variant="player" />
                            <div v-if="isInEvent && eventPlayerRoll !== null" class="event-roll-display event-roll-display--player">
                                <p class="event-roll-label">Roll</p>
                                <p class="event-roll-value">
                                    {{ eventPlayerRoll }}{{ eventStatBonus !== null && eventStatBonus !== 0 ? ` + ${eventStatBonus} ${eventStat}` : '' }}
                                    = {{ eventPlayerRoll! + (eventStatBonus ?? 0) }}
                                </p>
                            </div>
                        </template>

                        <template #center>
                            <EventView v-if="isInEvent" />
                            <template v-else-if="isInCombat">
                                <div class="cards-top">
                                    <div class="cards-top-left">
                                        <div class="deck-wrapper">
                                            <CardStack
                                                :cards="deck.cards"
                                                :name="AREAS.Deck"
                                                layout="pile"
                                                @click="onClick"
                                            />
                                            <div class="deck-count">{{ deckCount }} cards</div>
                                            <div class="deck-reshuffles">Reshuffles: {{ reshuffles }}</div>
                                        </div>
                                        <div class="compost-wrapper">
                                            <div v-if="manaDiamondsCost !== null" class="mana-diamonds-cost">
                                                -{{ manaDiamondsCost }} mana diamonds
                                            </div>
                                            <div v-if="showCastSpellText" class="cast-spell-text">
                                                Cast Spell
                                            </div>
                                            <CardStack
                                                :cards="compost.cards"
                                                :name="AREAS.Compost"
                                                :highlighted="isCompostHighlighted"
                                                :highlightType="compostHighlightType"
                                                customLabel="Compost"
                                                @click="onClick"
                                            />
                                            <div class="compost-count">{{ compostCount }} cards</div>
                                        </div>
                                        <div class="trash-wrapper" :class="{ 'trash-wrapper--empty': !hasTrashCards }">
                                            <CardStack
                                                :cards="trash.cards"
                                                :name="AREAS.Trash"
                                                customLabel="Trash (WIP)"
                                                @click="onClick"
                                            />
                                            <div class="trash-count">{{ trashCount }} cards</div>
                                        </div>
                                    </div>
                                    <div class="cards-top-right">
                                        <div class="mana-pools">
                                            <CardStack
                                                v-for="([_suit, manaPool], index) in Object.entries(manaPools)"
                                                :key="index"
                                                :cards="(manaPool as ManaPool).cards"
                                                :name="AREAS.ManaPools"
                                                :arrayIndex="index"
                                                :selectedCard="selectedCard"
                                                :highlighted="highlightedManaPoolIndex === index"
                                                highlightType="burn"
                                                @mousedown.prevent
                                                @click="onClick"
                                            />
                                        </div>
                                        <div class="mana-pools-buttons">
                                            <button
                                                type="button"
                                                class="move-to-mana-button"
                                                :disabled="!canMoveToManaPools"
                                                @click="onMoveToManaClick"
                                            >Auto Mana</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="tableau">
                                    <CardStack
                                        v-for="(cards, index) in tableau"
                                        :key="index"
                                        :cards="cards"
                                        :name="AREAS.Tableau"
                                        layout="vertical"
                                        :selectedCard="selectedCard"
                                        :arrayIndex="index as number"
                                        :highlighted="highlightedTableauIndices.includes(index)"
                                        highlightType="cast"
                                        @mousedown.prevent
                                        @click="onClick"
                                    />
                                </div>
                            </template>
                        </template>

                        <template #right>
                            <template v-if="isInEvent">
                                <h1>Event</h1>
                                <div class="event-name-panel" v-if="eventState.currentEvent.value">
                                    <h2 class="event-name">{{ eventState.currentEvent.value.name }}</h2>
                                    <div v-if="eventEventRoll !== null" class="event-roll-display event-roll-display--event">
                                        <p class="event-roll-label">Roll</p>
                                        <p class="event-roll-value">{{ eventEventRoll }}</p>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <h1 v-if="isInCombat">Enemy</h1>
                                <CombatantInfo v-if="isInCombat" :combatant="enemy" variant="enemy" />
                            </template>
                        </template>

                        <template #bottom>
                            <template v-if="isInEvent">
                                <div class="event-choices-area">
                                    <div v-if="!eventResultMessage" class="event-choices">
                                        <button
                                            v-for="(option, index) in eventState.currentEvent.value?.options ?? []"
                                            :key="index"
                                            type="button"
                                            class="event-choice"
                                            :disabled="eventIsResolving"
                                            @click="eventState.resolveChoice(option)"
                                        >
                                            {{ eventState.choiceLabel(option) }}
                                        </button>
                                    </div>
                                    <div v-else class="event-result">
                                        <p class="event-result-message">{{ eventResultMessage }}</p>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div v-if="isInCombat" class="cards-hand">
                                    <CardStack
                                        :cards="hand.cards"
                                        :name="AREAS.Hand"
                                        layout="horizontal"
                                        :selectedCard="selectedCard"
                                        @click="onClick"
                                    />
                                </div>
                                <div v-if="isInCombat" class="combat-bottom-buttons">
                                    <button
                                        v-if="!combat.isProcessingTurn"
                                        id="end-turn-button"
                                        type="button"
                                        @click="combat.endTurn"
                                    >
                                        End Turn
                                    </button>
                                </div>
                            </template>
                        </template>
                    </GameLayout>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.game-page {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.scale-wrapper {
    width: 1920px;
    height: 1080px;
    position: relative;
}

.scale-container {
    width: 100%;
    height: 100%;
    transform-origin: center center;
}

.game-screen {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.combat-bottom-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-right: 10px;
}

#end-turn-button {
    width: 200px;
    height: 100px;
    margin: 10px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 10px;
    cursor: pointer;
}

.cards-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    width: 100%;
    margin-top: 6px;
}

.cards-top-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
}

.deck-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    min-width: 120px;
    padding-left: 10px;
}

.deck-wrapper > :deep(.card-stack) {
    flex-shrink: 0;
    margin: 6px;
}

.deck-wrapper > :deep(.card-stack.pile .card-view) {
    margin: 0;
}

.trash-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    min-width: 120px;
}

.trash-wrapper > :deep(.card-stack) {
    flex-shrink: 0;
    width: 120px !important;
    margin: 6px;
}

.trash-wrapper > :deep(.card-stack.pile .card-view),
.trash-wrapper > :deep(.card-stack.pile .card-stack-empty) {
    margin: 0;
}

.trash-wrapper > :deep(.card-stack.pile) {
    width: 120px !important;
}

.trash-wrapper > .trash-count {
    flex-shrink: 0;
}

.trash-wrapper--empty {
    visibility: hidden;
    pointer-events: none;
}

.cards-top-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
}

.mana-pools {
    display: flex;
    justify-content: space-evenly;
    min-width: max-content;
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    overflow: hidden;
}

.mana-pools :deep(.card-stack) {
    max-width: 100%;
    overflow: hidden;
    position: relative;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.mana-pools :deep(.card-stack .mana-pool-pile-slot) {
    position: relative;
    width: 120px;
    aspect-ratio: 5 / 7;
}

.mana-pools :deep(.card-stack .mana-pool-pile-slot .card-view) {
    margin: 0;
}

.mana-pools-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.move-to-mana-button {
    margin-top: 0;
    padding: 2px 10px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #888;
    background: #f0f0f0;
    cursor: pointer;
    height: fit-content;
    width: fit-content;
}

.move-to-mana-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tableau {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
    width: 100%;
}

.cards-hand {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40%;
    height: 100%;
}

.compost-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    min-width: 120px;
    padding-right: 8px;
}

.compost-wrapper > :deep(.card-stack) {
    flex-shrink: 0;
    width: 120px !important;
    margin: 6px;
}

.compost-wrapper > :deep(.card-stack.pile .card-view),
.compost-wrapper > :deep(.card-stack.pile .card-stack-empty) {
    margin: 0;
}

.compost-wrapper > :deep(.card-stack.pile) {
    width: 120px !important;
}

.compost-wrapper > .compost-count {
    flex-shrink: 0;
}

.mana-diamonds-cost {
    position: absolute;
    top: 10px;
}

.cast-spell-text {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
    font-weight: bold;
    color: #4a90e2;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
}

.event-name-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 16px;
    min-height: 0;
}

.event-name {
    margin: 0;
    font-size: 1.5rem;
    text-align: center;
    color: #333;
}

.event-roll-display {
    margin-top: auto;
    padding: 8px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 6px;
}

.event-roll-display--player {
    margin-top: auto;
}

.event-roll-label {
    margin: 0 0 4px 0;
    font-size: 0.85rem;
    font-weight: bold;
    color: #555;
}

.event-roll-value {
    margin: 0;
    font-size: 1rem;
    color: #333;
}

.event-choices-area {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.event-choices {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    align-items: center;
}

.event-choice {
    padding: 14px 20px;
    font-size: 1rem;
    text-align: left;
    background: #e8e8e8;
    border: 2px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.event-choice:hover:not(:disabled) {
    background: #d0d0d0;
    border-color: #999;
}

.event-choice:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.event-result {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
}

.event-result-message {
    margin: 0;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    line-height: 1.5;
    text-align: center;
}
</style>

