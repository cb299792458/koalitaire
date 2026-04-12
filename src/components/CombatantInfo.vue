<script setup lang="ts">
    import { computed, ref } from 'vue'
    import type Player from '../models/Player'
    import type Enemy from '../models/Enemy'
    import FloatingNumber from './FloatingNumber.vue'
    import SummonDisplay from './SummonDisplay.vue'
    import useDamageNumbers, { getFlashClassForLatest } from '../composables/useDamageNumbers'
    import { formatStatSymbols } from '../utils/damageSymbol'
    import { combatStatusLabels } from '../game/combatStatuses'

    const props = withDefaults(
        defineProps<{
            combatant: Player | Enemy | null
            variant: 'player' | 'enemy'
            showBytecoins?: boolean
        }>(),
        { showBytecoins: false }
    )

    const CURSOR_OFFSET = 12
    const TOOLTIP_EDGE_PADDING = 20
    const TOOLTIP_DELAY = 800
    const CARDIFACT_TOOLTIP_DELAY = 300

    const tooltipX = ref(0)
    const tooltipY = ref(0)
    const tooltipRef = ref<HTMLElement | null>(null)
    const showTooltip = ref(false)
    let showDelay: ReturnType<typeof setTimeout> | null = null

    const tooltipStyle = computed(() => {
        const height = tooltipRef.value?.offsetHeight ?? 80
        const wouldOverflowBottom =
            tooltipY.value + height > window.innerHeight - TOOLTIP_EDGE_PADDING
        return {
            left: `${tooltipX.value}px`,
            top: wouldOverflowBottom
                ? `${tooltipY.value - height - TOOLTIP_EDGE_PADDING}px`
                : `${tooltipY.value}px`,
        }
    })

    function onPortraitMouseMove(e: MouseEvent) {
        tooltipX.value = e.clientX + CURSOR_OFFSET
        tooltipY.value = e.clientY + CURSOR_OFFSET
    }

    function onPortraitMouseEnter(e: MouseEvent) {
        onPortraitMouseMove(e)
        showDelay = setTimeout(() => {
            showTooltip.value = true
            showDelay = null
        }, TOOLTIP_DELAY)
    }

    function onPortraitMouseLeave() {
        if (showDelay !== null) {
            clearTimeout(showDelay)
            showDelay = null
        }
        showTooltip.value = false
    }

    const { playerNumbers, enemyNumbers } = useDamageNumbers()
    const damageNumbers = computed(() =>
        props.variant === 'player' ? playerNumbers.value : enemyNumbers.value
    )
    const flashClass = computed(() => getFlashClassForLatest(damageNumbers.value))

    const isPlayer = computed(() => props.variant === 'player')
    const isEnemy = computed(() => props.variant === 'enemy')

    const playerCardifacts = computed(() =>
        props.variant === 'player' && props.combatant ? (props.combatant as Player).cardifacts : []
    )

    const playerCombatStatuses = computed(() =>
        props.variant === 'player' && props.combatant ? (props.combatant as Player).combatStatuses : []
    )

    /** Same Teleport/fixed pattern as portrait — native `title` is clipped by overflow/transform. */
    const cardifactTooltipX = ref(0)
    const cardifactTooltipY = ref(0)
    const cardifactTooltipRef = ref<HTMLElement | null>(null)
    const cardifactTooltipText = ref<string | null>(null)
    const showCardifactTooltip = ref(false)
    let cardifactTooltipDelay: ReturnType<typeof setTimeout> | null = null

    const cardifactTooltipStyle = computed(() => {
        const height = cardifactTooltipRef.value?.offsetHeight ?? 80
        const wouldOverflowBottom =
            cardifactTooltipY.value + height > window.innerHeight - TOOLTIP_EDGE_PADDING
        return {
            left: `${cardifactTooltipX.value}px`,
            top: wouldOverflowBottom
                ? `${cardifactTooltipY.value - height - TOOLTIP_EDGE_PADDING}px`
                : `${cardifactTooltipY.value}px`,
        }
    })

    function onCardifactTooltipMove(e: MouseEvent) {
        cardifactTooltipX.value = e.clientX + CURSOR_OFFSET
        cardifactTooltipY.value = e.clientY + CURSOR_OFFSET
    }

    function onCardifactTooltipEnter(e: MouseEvent, description: string) {
        onCardifactTooltipMove(e)
        cardifactTooltipDelay = setTimeout(() => {
            cardifactTooltipText.value = description
            showCardifactTooltip.value = true
            cardifactTooltipDelay = null
        }, CARDIFACT_TOOLTIP_DELAY)
    }

    function onCardifactTooltipLeave() {
        if (cardifactTooltipDelay !== null) {
            clearTimeout(cardifactTooltipDelay)
            cardifactTooltipDelay = null
        }
        showCardifactTooltip.value = false
        cardifactTooltipText.value = null
    }
</script>

<template>
    <div
        v-if="combatant"
        :class="['combatant-info', `combatant-info--${variant}`, flashClass]"
    >
        <FloatingNumber
            v-for="number in damageNumbers"
            :key="number.id"
            :number="number"
        />
        <h2>{{ combatant.name }}</h2>
        <div
            class="portrait-tooltip-wrapper"
            @mousemove="onPortraitMouseMove"
            @mouseenter="onPortraitMouseEnter"
            @mouseleave="onPortraitMouseLeave"
        >
            <img
                :src="combatant.portrait"
                :alt="`${variant === 'player' ? 'Player' : 'Enemy'} Portrait`"
                width="100%"
            />
            <Teleport to="body">
                <div
                    ref="tooltipRef"
                    class="cursor-tooltip"
                    :class="{ 'cursor-tooltip--visible': showTooltip }"
                    :style="tooltipStyle"
                >
                    {{ combatant.tooltip }}
                </div>
            </Teleport>
        </div>
        <p><span class="suit-symbol suit-symbol--health" title="♥ Your life total. At 0 you're defeated.">♥</span> {{ combatant.health }} / {{ combatant.maxHealth }}</p>
        <p v-if="isPlayer"><span class="suit-symbol suit-symbol--mana-diamonds" title="♦ Mana Diamonds: Used to pay the difference when casting cards.">♦</span> {{ (combatant as Player).manaDiamonds }}</p>
        <p><span title="When you would take damage, ignore it completely and lose 1 dodge instead. Checked before block.">Dodge:</span> {{ combatant.dodge }}</p>
        <p><span title="Absorbs incoming damage before health.">Block:</span> {{ combatant.block }}</p>
        <div
            v-if="isPlayer && playerCombatStatuses.length"
            class="combatant-info__statuses"
        >
            <h3>Statuses</h3>
            <ul class="combatant-info__statuses-list">
                <li
                    v-for="(s, i) in playerCombatStatuses"
                    :key="`${s.id}-${i}`"
                >
                    {{ combatStatusLabels[s.id] }} ({{ s.turnsRemaining }})
                </li>
            </ul>
        </div>
        <p class="combatant-info__stats-gap"></p>
        <template v-if="isPlayer">
            <p>Appeal: {{ (combatant as Player).appeal }}</p>
            <p>Attack: {{ (combatant as Player).attack }}</p>
            <p>Armor: {{ combatant.armor }}</p>
            <p>Agility: {{ (combatant as Player).agility }}</p>
            <p>Acumen: {{ (combatant as Player).acumen }}</p>
            <p>{{ (combatant as Player).koallarbucks }} 💵</p>
            <p v-if="showBytecoins">Bytecoins: {{ (combatant as Player).bytecoins }}</p>
            <div v-if="playerCardifacts.length" class="combatant-info__cardifacts">
                <h3>Cardifacts</h3>
                <ul class="combatant-info__cardifacts-list">
                    <li
                        v-for="c in playerCardifacts"
                        :key="c.id"
                        class="combatant-info__cardifact-item"
                        @mouseenter="onCardifactTooltipEnter($event, c.description)"
                        @mousemove="onCardifactTooltipMove"
                        @mouseleave="onCardifactTooltipLeave"
                    >
                        {{ c.name }}
                    </li>
                </ul>
            </div>
        </template>
        <template v-else-if="isEnemy">
            <p>Attack: {{ (combatant as Enemy).attack }}</p>
            <p>Armor: {{ combatant.armor }}</p>
            <div class="combatant-info__actions">
                <p>Actions: {{ (combatant as Enemy).actions }}</p>
                <p
                    v-for="(action, index) in (combatant as Enemy).impendingActions"
                    :key="index"
                >
                    {{ action.name }}: <span v-html="formatStatSymbols(action.description)"></span>
                </p>
            </div>
        </template>
        <div v-if="combatant.summons.length" class="summons-list">
            <h3>Summons</h3>
            <SummonDisplay
                v-for="(summon, index) in combatant.summons"
                :key="index"
                :summon="summon"
            />
        </div>
        <Teleport to="body">
            <div
                v-if="cardifactTooltipText"
                ref="cardifactTooltipRef"
                class="cursor-tooltip"
                :class="{ 'cursor-tooltip--visible': showCardifactTooltip }"
                :style="cardifactTooltipStyle"
            >
                {{ cardifactTooltipText }}
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
    .combatant-info {
        overflow: auto;
        position: relative;
        transition: background-color 0.3s ease;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        width: 100%;
    }

    .portrait-tooltip-wrapper {
        position: relative;
    }

    .cursor-tooltip {
        position: fixed;
        padding: 6px 10px;
        max-width: 220px;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        font-size: 12px;
        line-height: 1.3;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease 0.3s;
    }

    .cursor-tooltip--visible {
        opacity: 1;
    }

    .combatant-info__stats-gap {
        margin-top: 0.5em;
        height: 0;
        overflow: hidden;
    }

    .combatant-info__actions {
        margin-top: 0.5rem;
    }

    .summons-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        margin-top: 8px;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    .summons-list h3 {
        margin: 0 0 4px 0;
        font-size: 14px;
    }

    .combatant-info__cardifacts {
        margin-top: 10px;
        width: 100%;
    }

    .combatant-info__cardifacts h3 {
        margin: 0 0 4px 0;
        font-size: 14px;
    }

    .combatant-info__cardifacts-list {
        margin: 0;
        padding-left: 1.15rem;
        font-size: 13px;
        line-height: 1.45;
    }

    .combatant-info__cardifact-item {
        cursor: help;
    }

    .combatant-info__statuses {
        margin-top: 8px;
        width: 100%;
    }

    .combatant-info__statuses h3 {
        margin: 0 0 4px 0;
        font-size: 14px;
    }

    .combatant-info__statuses-list {
        margin: 0;
        padding-left: 1.15rem;
        font-size: 13px;
        line-height: 1.45;
    }

    </style>
