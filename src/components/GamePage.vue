<script setup lang="ts">
    import Card from '../models/Card'
    import { Suits } from '../models/Suit'
    import CardStack from './Cards/CardStack.vue'
    import { useCombat } from '../composables/useCombat'
    import { AREAS, type Area } from '../models/Areas'
    import ModalManager from './ModalManager.vue'
    import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
    import { openModal, closeModal, useModalState, openMessageModal } from '../stores/modalStore'
    import CombatantInfo from './CombatantInfo.vue'
    import type Enemy from '../models/Enemy'
    import makeScenario, { getNextRowOptions, type ScenarioEntry } from '../game/makeScenario'
    import { bossFromId, bossIdsForGauntlet, pickBossForNewAct, shuffleArray } from '../game/actProgress'
    import { BOSS_ENCOUNTER_ENEMIES } from '../models/enemies'
    import type Player from '../models/Player'
    import type Cardifact from '../models/Cardifact'
    import { useTown } from '../composables/useTown'
    import { useEvent } from '../composables/useEvent'
    import { hasChosenCharacterRef, combatRef, scenarioRef } from '../composables/useCombat'
    import EventView from './EventView.vue'
    import GameLayout from './GameLayout.vue'
    import { formatStatSymbols } from '../utils/damageSymbol'
    import { diamondSuitSvgInner } from '../utils/suitUiSymbols'
    import type { EndTurnDamagePreview } from '../game/endTurnDamagePreview'

    const DECK_PILE_TOOLTIP = 'Your deck starts here'
    const RECYCLING_PILE_TOOLTIP =
        'At the end of each turn, recycling and the tableau are gathered, shuffled into the deck, and the tableau is redealt. If your mana pools are not full, compost stays separate; trash is never mixed in.'
    const COMPOST_PILE_TOOLTIP =
        'Spells go to compost when cast. When you end your turn with every mana card in the mana pools, compost and those mana pool cards are shuffled into the deck with the tableau and recycling, then redealt to the tableau.'
    const TRASH_PILE_TOOLTIP =
        'Trashed cards stay here until the end of combat, then they are removed from play.'

    const modalState = useModalState()
    const town = useTown()
    const eventState = useEvent()
    const combat = useCombat()

    combat.onEnemyDefeated = () => {
        const p = combat.originalPlayer ?? combat.player
        const e = combat.enemy
        if (!p || !e) return
        const id = e.constructor.name
        const isBossPool = BOSS_ENCOUNTER_ENEMIES.some((C) => C.name === id)
        if (!isBossPool) return
        if (!p.defeatedBossIds.includes(id)) {
            p.defeatedBossIds.push(id)
        }
        if (p.inKoalaLumpurGauntlet && p.gauntletBossIdsRemaining[0] === id) {
            p.gauntletBossIdsRemaining.shift()
        }
    }

    const WIN_KOALA_LUMPUR = `🐨 You Win! 🐨

You defeated your dad and brought democratic socialism to Koala Lumpur!
All of the remaining monarchs and billionaires have been put to executed,
and all the animals live in harmony after the abject failure of capitalism.

`

    async function openMapDeckForPlayer(p: Player, keepOpen = true) {
        if (p.inKoalaLumpurGauntlet) {
            if (p.gauntletBossIdsRemaining.length === 0) {
                openMessageModal(WIN_KOALA_LUMPUR)
                return
            }
            const nextId = p.gauntletBossIdsRemaining[0]!
            const NextBoss = bossFromId(nextId)
            await combat.start(p, new NextBoss())
            return
        }

        const nextOptions = getNextRowOptions(p.scenarioRow, p.scenarioColumn)
        if (nextOptions.length === 0) {
            openModal(
                'actEndChoice',
                {
                    actNumber: p.actNumber,
                    onLiberateVassal: () => {
                        closeModal()
                        p.actNumber += 1
                        const boss = pickBossForNewAct(p.defeatedBossIds)
                        scenarioRef.value = makeScenario({ lastRowBoss: boss })
                        p.scenarioRow = 0
                        p.scenarioColumn = 0
                        p.level = 0
                        openMapDeckForPlayer(p, keepOpen)
                    },
                    onChallengeFather: () => {
                        closeModal()
                        p.inKoalaLumpurGauntlet = true
                        p.gauntletBossIdsRemaining = shuffleArray(bossIdsForGauntlet(p.defeatedBossIds))
                        p.scenarioRow = 0
                        p.scenarioColumn = 0
                        p.level = 0
                        if (p.gauntletBossIdsRemaining.length === 0) {
                            openMessageModal(WIN_KOALA_LUMPUR)
                            return
                        }
                        const firstId = p.gauntletBossIdsRemaining[0]!
                        const FirstBoss = bossFromId(firstId)
                        void combat.start(p, new FirstBoss())
                    },
                },
                { keepOpen: true, transparentOverlay: true }
            )
            return
        }
        openModal('backAtCamp', {
            player: p,
            scenario: scenarioRef.value ?? [],
            actNumber: p.actNumber,
            onContinue: (player: Player, row: number, col: number) => {
                closeModal()
                startCombatForPlayer(player, row, col)
            },
        }, { keepOpen })
    }

    combat.onEnemyDefeatedContinue = () => {
        closeModal()
        const p = combat.originalPlayer ?? combat.player
        if (p) openMapDeckForPlayer(p)
    }
    const player = computed(() =>
        isInEvent.value ? eventState.player.value : combat.player
    )
    const enemy = computed(() => combatRef.value?.enemy)

    const deck = combat.deck
    const recycling = combat.recycling
    const compost = combat.compost
    const trash = combat.trash

    /** Cards for hand slot i (one card or empty). Uses current combat hand so it updates after start(). */
    function getHandSlotCards(slotIndex: number): Card[] {
        const hand = combatRef.value?.hand
        if (!hand) return []
        const card = hand.getSlot(slotIndex)
        return card ? [card] : []
    }

    /** Empty hand slot is only clickable when a valid card can be placed there. */
    function isHandSlotClickable(slotIndex: number): boolean {
        const hand = combatRef.value?.hand
        if (hand?.getSlot(slotIndex) != null) return true
        return combat.canPlaceSelectedInHandSlot(slotIndex)
    }
    const tableau = computed(() => combatRef.value?.tableau.getCardsArrays() ?? [])
    const manaPools = combat.manaPools
    const selectedCard = computed(() => combatRef.value?.selectedCard ?? null)
    /** Number of hand slots to show; from current player so it updates when starting combat. */
    const handSlotCount = computed(() => Math.max(1, combatRef.value?.player?.handSlotCount ?? 1))

    const allManaPoolCounts = computed(() =>
        combat.manaPools.pools().map((pool) => pool.cards.length)
    )
    const canMoveToManaPools = computed(
        () => combat.getCardsMovableToManaPools().length > 0
    )

    /** Index of the mana pool being hovered (0–4), or null when not over a pool. */
    const hoveredManaPoolIndex = ref<number | null>(null)
    /** Mouse over the Auto Mana button — highlights burnable / preview cards. */
    const hoverAutoMana = ref(false)
    /** Mouse over the Cast Spell button — highlights every castable spell for current mana. */
    const hoverCastSpell = ref(false)
    /** Cards that could be burned to the currently hovered mana pool only. */
    const cardsThatCouldBeBurnedToHoveredPool = computed(() => {
        const index = hoveredManaPoolIndex.value
        if (index == null || index < 0 || index >= Suits.length) return []
        const suit = Suits[index]
        if (suit == null) return []
        const pool = combat.manaPools.getPool(suit)
        if (!pool) return []
        const out: Card[] = []
        for (const column of combat.tableau.getColumns()) {
            for (const card of column.cards) {
                if (!card.revealed || card.isSpell || card.suit !== suit) continue
                if (pool.hasEnoughManaForBurn(card.rank)) out.push(card)
            }
        }
        const hand = combatRef.value?.hand
        if (hand) {
            for (const card of hand.cards) {
                if (!card.revealed || card.isSpell || card.suit !== suit) continue
                if (pool.hasEnoughManaForBurn(card.rank)) out.push(card)
            }
        }
        return out
    })
    /** Indices of cards in this tableau column that could be burned to the hovered pool. */
    function getTableauColumnManaHighlightIndices(columnIndex: number): number[] {
        const columns = combat.tableau.getColumns()
        const col = columns[columnIndex]
        if (!col) return []
        const set = new Set(cardsThatCouldBeBurnedToHoveredPool.value)
        const indices: number[] = []
        col.cards.forEach((card, i) => {
            if (set.has(card)) indices.push(i)
        })
        return indices
    }
    function isTableauColumnMovableToMana(columnIndex: number): boolean {
        return getTableauColumnManaHighlightIndices(columnIndex).length > 0
    }
    function isHandSlotMovableToMana(slotIndex: number): boolean {
        const hand = combatRef.value?.hand
        const card = hand?.getSlot(slotIndex)
        return card != null && cardsThatCouldBeBurnedToHoveredPool.value.includes(card)
    }

    const isInEvent = computed(() => eventState.isInEvent.value)
    const isBackAtCampOpen = computed(() => modalState.currentModal?.name === 'backAtCamp')
    const isInCombat = computed(() => !isInEvent.value && !isBackAtCampOpen.value)
    const eventPlayerRoll = computed(() => eventState.lastPlayerRoll.value)
    const eventEventRoll = computed(() => eventState.lastEventRoll.value)
    const eventStatBonus = computed(() => eventState.lastStatBonus.value)
    const eventStat = computed(() => eventState.lastStat.value)
    const eventResultMessage = computed(() => eventState.resultMessage.value)
    const eventIsResolving = computed(() => eventState.isResolving.value)
    const isProcessing = computed(() => (combatRef.value?.isProcessingTurn ?? false) || eventIsResolving.value)

    const endTurnDamagePreview = ref<EndTurnDamagePreview | null>(null)
    let endTurnPreviewRequestId = 0

    watch(
        () => {
            const c = combatRef.value
            if (!c) return ''
            const p = c.player
            const e = c.enemy
            return [
                isInCombat.value,
                c.isProcessingTurn,
                p?.health,
                p?.block,
                p?.dodge,
                p?.incomingDamageMultiplier,
                p?.outgoingDamageMultiplier,
                p?.summons?.map((s) => `${s.hp},${s.damage}`).join(';'),
                e?.health,
                e?.block,
                e?.dodge,
                e?.incomingDamageMultiplier,
                e?.outgoingDamageMultiplier,
                e?.summons?.map((s) => `${s.hp},${s.damage}`).join(';'),
                e?.attack,
                e?.impendingActions?.map((a) => a.name).join(','),
            ].join('|')
        },
        async () => {
            const req = ++endTurnPreviewRequestId
            const c = combatRef.value
            if (!isInCombat.value || !c || c.isProcessingTurn) {
                endTurnDamagePreview.value = null
                return
            }
            try {
                const preview = await c.computeEndTurnDamagePreviewAsync()
                if (req === endTurnPreviewRequestId) {
                    endTurnDamagePreview.value = preview
                }
            } catch {
                if (req === endTurnPreviewRequestId) {
                    endTurnDamagePreview.value = null
                }
            }
        },
        { immediate: true }
    )

    const autoManaButtonDisabled = computed(
        () =>
            !canMoveToManaPools.value ||
            isProcessing.value ||
            (combatRef.value?.isMovingToMana ?? false)
    )

    /** Cards to outline for Auto Mana hover: all movable bottoms + hand when button enabled; per-suit next when disabled. */
    const autoManaHoverBurnCards = computed(() => {
        if (!hoverAutoMana.value || selectedCard.value) return new Set<Card>()
        void tableau.value
        void allManaPoolCounts.value
        void combatRef.value?.isMovingToMana
        const cards = autoManaButtonDisabled.value
            ? combat.getAutoManaNextPerSuitPreview()
            : combat.getCardsMovableToManaPools()
        return new Set(cards)
    })

    function getTableauColumnAutoManaHighlightIndices(columnIndex: number): number[] {
        const columns = combat.tableau.getColumns()
        const col = columns[columnIndex]
        if (!col) return []
        const set = autoManaHoverBurnCards.value
        const indices: number[] = []
        col.cards.forEach((card, i) => {
            if (set.has(card)) indices.push(i)
        })
        return indices
    }

    function isTableauColumnHighlightedForAutoMana(columnIndex: number): boolean {
        return getTableauColumnAutoManaHighlightIndices(columnIndex).length > 0
    }

    function isHandSlotHighlightedForAutoMana(slotIndex: number): boolean {
        const hand = combatRef.value?.hand
        const card = hand?.getSlot(slotIndex)
        return card != null && autoManaHoverBurnCards.value.has(card)
    }

    /** Burn highlights: Auto Mana button hover takes precedence over mana-pool hover. */
    function getTableauBurnHighlightIndices(columnIndex: number): number[] | undefined {
        if (selectedCard.value) return undefined
        if (hoverAutoMana.value) {
            const idx = getTableauColumnAutoManaHighlightIndices(columnIndex)
            return idx.length > 0 ? idx : undefined
        }
        if (hoveredManaPoolIndex.value != null) {
            const idx = getTableauColumnManaHighlightIndices(columnIndex)
            return idx.length > 0 ? idx : undefined
        }
        return undefined
    }

    function isTableauColumnBurnHighlighted(columnIndex: number): boolean {
        if (selectedCard.value) return false
        if (hoverAutoMana.value) return isTableauColumnHighlightedForAutoMana(columnIndex)
        if (hoveredManaPoolIndex.value != null) return isTableauColumnMovableToMana(columnIndex)
        return false
    }

    const castSpellHoverCardSet = computed(() => {
        if (!hoverCastSpell.value) return new Set<Card>()
        void selectedCard.value
        void tableau.value
        void allManaPoolCounts.value
        void combatRef.value?.player?.manaDiamonds
        return new Set(combat.getCastableSpellCards())
    })

    function getTableauColumnCastSpellHighlightIndices(columnIndex: number): number[] {
        const columns = combat.tableau.getColumns()
        const col = columns[columnIndex]
        if (!col) return []
        const set = castSpellHoverCardSet.value
        const indices: number[] = []
        col.cards.forEach((card, i) => {
            if (set.has(card)) indices.push(i)
        })
        return indices
    }

    function isTableauColumnHighlightedForCastSpellHover(columnIndex: number): boolean {
        return getTableauColumnCastSpellHighlightIndices(columnIndex).length > 0
    }

    function isHandSlotCastSpellHover(slotIndex: number): boolean {
        const hand = combatRef.value?.hand
        const card = hand?.getSlot(slotIndex)
        return card != null && castSpellHoverCardSet.value.has(card)
    }

    /** Burn (Auto Mana / pool) or cast-spell-button hover indices; placement uses separate column highlight. */
    function getTableauPointerHighlightIndices(columnIndex: number): number[] | undefined {
        if (hoverCastSpell.value) {
            const idx = getTableauColumnCastSpellHighlightIndices(columnIndex)
            return idx.length > 0 ? idx : undefined
        }
        if (selectedCard.value) return undefined
        return getTableauBurnHighlightIndices(columnIndex)
    }

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
            }, { keepOpen: true, transparentOverlay: true })
        }
    })

    const deckCount = computed(() => combatRef.value?.deck.cards.length ?? 0)
    const recyclingCount = computed(() => combatRef.value?.recycling.cards.length ?? 0)
    const compostCount = computed(() => combatRef.value?.compost.cards.length ?? 0)
    const trashCount = computed(() => combatRef.value?.trash.cards.length ?? 0)
    
    const manaDiamondsCost = computed(() => {
        const cost = combat.getManaDiamondsNeededForCast()
        return cost > 0 && combat.canCastSelectedCard() ? cost : null
    })

    const canCastSpell = computed(() => {
        void selectedCard.value
        void allManaPoolCounts.value
        void combatRef.value?.player?.manaDiamonds
        return combat.canCastSelectedCard()
    })

    const highlightedManaPoolIndex = computed(() => {
        const card = selectedCard.value
        if (!card || !card.revealed || card.isSpell) return -1

        const { rank, suit } = card
        if (suit == null) return -1

        const manaPool = combat.manaPools.getPool(suit)
        if (!manaPool || manaPool.cards.length !== rank - 1) return -1

        void allManaPoolCounts.value

        const handIndex = combat.hand.getSlotIndex(card)
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
        const row = (scenarioRef.value ?? [])[rowIdx]
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
            await combat.start(newPlayer, new entry.elite(), { defeatReward: 'relics' })
            return
        }
        if ('boss' in entry && entry.boss) {
            eventState.resetEventState()
            await combat.start(newPlayer, new entry.boss())
            return
        }
        if ('enemy' in entry && entry.enemy) {
            eventState.resetEventState()
            await combat.start(newPlayer, new entry.enemy())
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

    function onCastSpellClick() {
        combat.castSelectedSpell()
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
                    scenarioRef.value = makeScenario({
                        lastRowBoss: pickBossForNewAct(newPlayer.defeatedBossIds),
                    })
                    hasChosenCharacterRef.value = true
                    openModal('cardifactPick', {
                        onPick: (cardifact: Cardifact) => {
                            newPlayer.addCardifact(cardifact)
                            closeModal()
                            nextTick(() => openMapDeckForPlayer(newPlayer))
                        },
                    }, { keepOpen: true })
                    return false
                },
            }, { keepOpen: true })
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
                    :class="{ 'cursor-wait': isProcessing }"
                    @click="onClick({ card: null, area: AREAS.Board, cardIndex: -1 })"
                >
                    <GameLayout>
                        <template #left>
                            <h1>Player</h1>
                            <CombatantInfo
                                :combatant="player"
                                variant="player"
                                :pending-end-turn-hp-loss="endTurnDamagePreview?.playerHpLoss ?? null"
                                :pending-end-turn-block-loss="endTurnDamagePreview?.playerBlockLoss ?? null"
                                :pending-end-turn-summon-hp-losses="endTurnDamagePreview?.playerSummonHpLosses ?? null"
                            />
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
                                        <div class="deck-wrapper pile-slot-area">
                                            <CardStack
                                                :cards="deck.cards"
                                                :name="AREAS.Deck"
                                                layout="pile"
                                                customLabel="Deck"
                                                :pile-tooltip="DECK_PILE_TOOLTIP"
                                                @click="onClick"
                                            />
                                            <div class="pile-slot-count">{{ deckCount }} cards</div>
                                        </div>
                                        <div class="recycling-wrapper pile-slot-area">
                                            <CardStack
                                                :cards="recycling.cards"
                                                :name="AREAS.Recycling"
                                                layout="pile"
                                                customLabel="Recycling"
                                                :pile-tooltip="RECYCLING_PILE_TOOLTIP"
                                                @click="onClick"
                                            />
                                            <div class="pile-slot-count">{{ recyclingCount }} cards</div>
                                        </div>
                                        <div class="compost-wrapper pile-slot-area">
                                            <CardStack
                                                :cards="compost.cards"
                                                :name="AREAS.Compost"
                                                customLabel="Compost"
                                                :pile-tooltip="COMPOST_PILE_TOOLTIP"
                                                @click="onClick"
                                            />
                                            <div class="pile-slot-count">{{ compostCount }} cards</div>
                                        </div>
                                        <div class="trash-wrapper">
                                            <CardStack
                                                :cards="trash.cards"
                                                :name="AREAS.Trash"
                                                customLabel="Trash"
                                                :pile-tooltip="TRASH_PILE_TOOLTIP"
                                                @click="onClick"
                                            />
                                            <div class="trash-count">{{ trashCount }} cards</div>
                                        </div>
                                    </div>
                                    <div class="cards-top-right">
                                        <div class="mana-pools-battle">
                                            <div
                                                class="mana-pools"
                                                @mouseleave="hoveredManaPoolIndex = null"
                                            >
                                                <CardStack
                                                    v-for="([_suit, manaPool], index) in manaPools.entries()"
                                                    :key="index"
                                                    :cards="manaPool.cards"
                                                    :name="AREAS.ManaPools"
                                                    :arrayIndex="index"
                                                    :selectedCard="selectedCard"
                                                    :highlighted="highlightedManaPoolIndex === index"
                                                    highlightType="burn"
                                                    @mouseenter="hoveredManaPoolIndex = index"
                                                    @mousedown.prevent
                                                    @click="onClick"
                                                />
                                            </div>
                                        </div>
                                        <div class="mana-pools-buttons">
                                            <div class="mana-pools-buttons-row">
                                                <button
                                                    type="button"
                                                    class="cast-spell-button"
                                                    :disabled="!canCastSpell || isProcessing || combat.isMovingToMana"
                                                    title="Mana diamonds pay the gap when your pools do not cover the full rank."
                                                    @mouseenter="hoverCastSpell = true"
                                                    @mouseleave="hoverCastSpell = false"
                                                    @click="onCastSpellClick"
                                                >
                                                    Cast Spell<template v-if="manaDiamondsCost !== null">
                                                        (-{{ manaDiamondsCost }}<span
                                                            class="suit-symbol suit-symbol--mana-diamonds"
                                                            aria-hidden="true"
                                                            v-html="diamondSuitSvgInner"
                                                        ></span>)
                                                    </template>
                                                </button>
                                                <button
                                                    type="button"
                                                    class="move-to-mana-button"
                                                    :disabled="!canMoveToManaPools || isProcessing || combat.isMovingToMana"
                                                    @mouseenter="hoverAutoMana = true"
                                                    @mouseleave="hoverAutoMana = false"
                                                    @click="onMoveToManaClick"
                                                >
                                                    Auto Mana
                                                </button>
                                            </div>
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
                                        :highlighted="
                                            (hoverCastSpell && isTableauColumnHighlightedForCastSpellHover(index)) ||
                                            (hoverAutoMana && !selectedCard && isTableauColumnBurnHighlighted(index)) ||
                                            (hoveredManaPoolIndex != null && !selectedCard && !hoverAutoMana && isTableauColumnMovableToMana(index)) ||
                                            (!!selectedCard && highlightedTableauIndices.includes(index))
                                        "
                                        :highlightedIndices="getTableauPointerHighlightIndices(index)"
                                        :highlightType="(hoverAutoMana || hoveredManaPoolIndex != null) && !selectedCard && !hoverCastSpell ? 'burn' : 'cast'"
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
                                <CombatantInfo
                                    v-if="isInCombat"
                                    :combatant="(enemy ?? null) as Player | Enemy | null"
                                    variant="enemy"
                                    :pending-end-turn-hp-loss="endTurnDamagePreview?.enemyHpLoss ?? null"
                                    :pending-end-turn-summon-hp-losses="endTurnDamagePreview?.enemySummonHpLosses ?? null"
                                />
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
                                            <span v-html="formatStatSymbols(eventState.choiceLabel(option))"></span>
                                        </button>
                                    </div>
                                    <div v-else class="event-result">
                                        <p class="event-result-message" v-html="eventResultMessage ? formatStatSymbols(eventResultMessage) : ''"></p>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div v-if="isInCombat" class="cards-hand">
                                    <div
                                        v-for="slotIndex in handSlotCount"
                                        :key="slotIndex - 1"
                                        :class="{ 'hand-slot--no-click': !isHandSlotClickable(slotIndex - 1) }"
                                        class="hand-slot-wrapper"
                                    >
                                        <CardStack
                                            :cards="getHandSlotCards(slotIndex - 1)"
                                            :name="AREAS.Hand"
                                            layout="pile"
                                            :selectedCard="selectedCard"
                                            :arrayIndex="slotIndex - 1"
                                            :highlighted="
                                                (hoverCastSpell && isHandSlotCastSpellHover(slotIndex - 1)) ||
                                                (hoverAutoMana && !selectedCard && isHandSlotHighlightedForAutoMana(slotIndex - 1)) ||
                                                (hoveredManaPoolIndex != null && !selectedCard && !hoverAutoMana && isHandSlotMovableToMana(slotIndex - 1))
                                            "
                                            :highlightType="(hoverAutoMana || hoveredManaPoolIndex != null) && !selectedCard && !hoverCastSpell ? 'burn' : 'cast'"
                                            customLabel="Hand"
                                            @click="onClick"
                                        />
                                    </div>
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

:deep(.game-left h1),
:deep(.game-right h1) {
    margin: 0 0 8px;
    font-size: 2rem;
    line-height: 1;
    text-align: center;
}

.combat-bottom-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-right: 4px;
    min-width: 220px;
    min-height: 100%;
    flex-shrink: 0;
}

#end-turn-button {
    width: 180px;
    height: 86px;
    margin: 0;
    background: #f4f4f4;
    border: 1px solid #8b8b8b;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
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
    gap: 8px;
}

/* Shared layout for deck and compost so they align and look the same when empty */
.pile-slot-area {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 140px;
    min-width: 140px;
    min-height: 220px;
    padding: 0 10px;
    flex-shrink: 0;
}

.pile-slot-area > :deep(.card-stack) {
    flex-shrink: 0;
    margin: 6px;
    width: 120px;
    min-width: 120px;
    height: 168px;
    min-height: 168px;
}

.pile-slot-area > :deep(.card-stack.pile .card-view),
.pile-slot-area > :deep(.card-stack.pile .card-stack-empty) {
    margin: 0;
}

.pile-slot-area > .pile-slot-count {
    flex-shrink: 0;
    min-height: 1.5em;
    line-height: 1.5;
    text-align: center;
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

.cards-top-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    gap: 4px;
}

.mana-pools-battle {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.mana-pools {
    display: flex;
    justify-content: space-between;
    min-width: max-content;
    width: 100%;
    min-height: 200px;
    padding: 4px 8px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
}

/* Slightly larger than card (120x168) so borders/shadows aren't clipped */
.mana-pools :deep(.card-stack) {
    flex-shrink: 0;
    width: 126px;
    min-width: 126px;
    height: 176px;
    min-height: 176px;
    overflow: visible;
    position: relative;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Empty mana pool placeholder: same size as real cards (DummyCard has margin by default) */
.mana-pools :deep(.card-stack .card-stack-empty) {
    margin: 0;
    width: 120px;
    height: 168px;
    min-width: 120px;
    min-height: 168px;
}

.mana-pools :deep(.card-stack .mana-pool-pile-slot) {
    position: relative;
    width: 126px;
    min-width: 126px;
    height: 176px;
    min-height: 176px;
    aspect-ratio: 5 / 7;
    display: flex;
    justify-content: center;
    align-items: center;
}

.mana-pools :deep(.card-stack .mana-pool-pile-slot .card-view) {
    margin: 0;
}

.mana-pools-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    width: 100%;
}

.mana-pools-buttons-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: stretch;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 12px;
}

.cast-spell-button,
.move-to-mana-button {
    margin-top: 0;
    padding: 10px 16px;
    font-size: 15px;
    border-radius: 6px;
    border: 1px solid #888;
    background: #f0f0f0;
    min-width: 170px;
    flex: 1 1 0;
    max-width: 260px;
    text-align: center;
    line-height: 1.25;
}

.cast-spell-button {
    white-space: normal;
}

.cast-spell-button:disabled,
.move-to-mana-button:disabled {
    opacity: 0.5;
}

.tableau {
    margin-top: 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: flex-start;
    gap: 8px;
    height: 100%;
    width: 100%;
}

.cards-hand {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 36px;
    flex: 1;
    min-width: 0;
    height: 100%;
    min-height: 150px;
}

/* Hand slots: same size as mana pool slots (4 fixed slots) */
.hand-slot-wrapper {
    flex-shrink: 0;
}

.hand-slot--no-click {
    pointer-events: none;
    cursor: default;
}

.cards-hand :deep(.card-stack) {
    flex-shrink: 0;
    width: 118px;
    min-width: 118px;
    height: 166px;
    min-height: 166px;
    overflow: visible;
    position: relative;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cards-hand :deep(.card-stack .card-stack-empty) {
    margin: 0;
    width: 112px;
    height: 158px;
    min-width: 112px;
    min-height: 158px;
}

.cards-hand :deep(.card-stack.pile .card-view) {
    margin: 0;
}

/* When hand slot has a card, the inner wrapper needs to size/center like mana pool slot */
.cards-hand :deep(.card-stack > div:not(.card-stack-empty)) {
    position: relative;
    width: 118px;
    min-width: 118px;
    height: 166px;
    min-height: 166px;
    display: flex;
    justify-content: center;
    align-items: center;
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
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: left;
    background: #e8e8e8;
    border: 2px solid #ccc;
    border-radius: 8px;
    transition: background 0.2s, border-color 0.2s;
}

.event-choice:hover:not(:disabled) {
    background: #d0d0d0;
    border-color: #999;
}

.event-choice:disabled {
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
    font-family: var(--font-game-mono);
    background: #f5f5f5;
    border-radius: 8px;
    line-height: 1.5;
    text-align: center;
}
</style>

