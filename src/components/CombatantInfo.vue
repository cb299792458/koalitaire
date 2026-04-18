<script setup lang="ts">
    import { computed, ref } from 'vue'
    import type Player from '../models/Player'
    import type Enemy from '../models/Enemy'
    import FloatingNumber from './FloatingNumber.vue'
    import SummonDisplay from './SummonDisplay.vue'
    import useDamageNumbers, { getFlashClassForLatest } from '../composables/useDamageNumbers'
    import { formatStatSymbols, BLOCK_STAT_SYMBOL_HTML, BLOCK_SHIELD_SVG_INNER } from '../utils/damageSymbol'
    import { diamondSuitSvgInner, heartSuitSvgInner } from '../utils/suitUiSymbols'
    import { combatStatusLabels, getCombatStatusTooltip } from '../game/combatStatuses'

    const props = withDefaults(
        defineProps<{
            combatant: Player | Enemy | null
            variant: 'player' | 'enemy'
            showBytecoins?: boolean
            /** Net ♥ loss if End Turn resolved now (0 = hide). */
            pendingEndTurnHpLoss?: number | null
            /** Player only: block consumed by incoming hits if End Turn resolved now (0 = hide). */
            pendingEndTurnBlockLoss?: number | null
            /** Per-summon ♥ loss vs current `combatant.summons` order; omit entries or use null when unknown. */
            pendingEndTurnSummonHpLosses?: number[] | null
        }>(),
        {
            showBytecoins: false,
            pendingEndTurnHpLoss: null,
            pendingEndTurnBlockLoss: null,
            pendingEndTurnSummonHpLosses: null,
        }
    )

    const CURSOR_OFFSET = 12
    const TOOLTIP_EDGE_PADDING = 20
    const TOOLTIP_DELAY = 800
    const INFO_TOOLTIP_DELAY = 300

    /** Teleport tooltips for stats and cardifacts (native title is clipped by overflow). */
    const statTooltips = {
        health: 'Hearts: Current / Maximum Health',
        manaDiamonds:
            'Diamonds: Condensed mana, spent to cast a spell if you do not have enough mana cards in the corresponding pool.',
        dodge: 'Dodge: Each point negates one incoming damage instance entirely, before block. Consumed when it stops a hit.',
        block: 'Block: Absorbs incoming damage before it reduces health. Applied after dodge, but before damage to summons. Magic damage ignores block.',
        pendingEndTurnDamage:
            'If you press End Turn now: net hearts lost after your summons attack, then the enemy acts (their listed actions and summons). Summon rows show extra ♥ loss they would take. Does not include recycling the tableau.',
        pendingEndTurnBlockLoss:
            'If you press End Turn now: block your shields will lose from enemy hits (damage absorbed by block before HP). Does not include recycling the tableau.',
        appeal: 'Appeal: Charisma and Leadership.',
        attackPlayer: 'Attack: Damage dealt by regular attacks.',
        attackEnemy: 'Attack: Added to this enemy\'s damage when they use attack actions.',
        armorPlayer: 'Armor: Constitution and Endurance.',
        armorEnemy:
            'Used by this enemy\'s actions (e.g. extra block); some enemy skills increase armor.',
        agility: 'Agility: Dexterity and Speed.',
        acumen: 'Acumen: Intelligence and Magical Knowledge.',
        koallarbucks: 'Koallarbucks: The official currency of Straya',
        appealEnemy: 'This enemy\'s appeal. Used by special actions or effects when relevant.',
        agilityEnemy: 'This enemy\'s agility. Used by special actions or effects when relevant.',
        acumenEnemy: 'This enemy\'s acumen. Used by special actions or effects when relevant.',
    } as const

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

    const enemyCombatStatuses = computed(() =>
        props.variant === 'enemy' && props.combatant ? (props.combatant as Enemy).combatStatuses : []
    )

    /** Same Teleport/fixed pattern as portrait — native `title` is clipped by overflow/transform. */
    const infoTooltipX = ref(0)
    const infoTooltipY = ref(0)
    const infoTooltipRef = ref<HTMLElement | null>(null)
    const infoTooltipText = ref<string | null>(null)
    const showInfoTooltip = ref(false)
    let infoTooltipDelay: ReturnType<typeof setTimeout> | null = null

    const infoTooltipStyle = computed(() => {
        const height = infoTooltipRef.value?.offsetHeight ?? 80
        const wouldOverflowBottom =
            infoTooltipY.value + height > window.innerHeight - TOOLTIP_EDGE_PADDING
        return {
            left: `${infoTooltipX.value}px`,
            top: wouldOverflowBottom
                ? `${infoTooltipY.value - height - TOOLTIP_EDGE_PADDING}px`
                : `${infoTooltipY.value}px`,
        }
    })

    function onInfoTooltipMove(e: MouseEvent) {
        infoTooltipX.value = e.clientX + CURSOR_OFFSET
        infoTooltipY.value = e.clientY + CURSOR_OFFSET
    }

    function onInfoTooltipEnter(e: MouseEvent, text: string) {
        onInfoTooltipMove(e)
        infoTooltipDelay = setTimeout(() => {
            infoTooltipText.value = text
            showInfoTooltip.value = true
            infoTooltipDelay = null
        }, INFO_TOOLTIP_DELAY)
    }

    function onInfoTooltipLeave() {
        if (infoTooltipDelay !== null) {
            clearTimeout(infoTooltipDelay)
            infoTooltipDelay = null
        }
        showInfoTooltip.value = false
        infoTooltipText.value = null
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
        <p
            class="combatant-info__stat-line combatant-info__health-row"
            @mousemove="onInfoTooltipMove"
            @mouseleave="onInfoTooltipLeave"
        >
            <span @mouseenter="onInfoTooltipEnter($event, statTooltips.health)">
                <span
                    class="suit-symbol suit-symbol--health"
                    title="Health"
                    v-html="heartSuitSvgInner"
                ></span>
                {{ combatant.health }} /
                {{ combatant.maxHealth }}
            </span>
            <span
                v-if="pendingEndTurnHpLoss != null && pendingEndTurnHpLoss > 0"
                class="combatant-info__end-turn-preview-inline"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.pendingEndTurnDamage)"
            > (-{{ pendingEndTurnHpLoss
                }}<span
                    class="suit-symbol suit-symbol--health"
                    aria-hidden="true"
                    v-html="heartSuitSvgInner"
                ></span>)
            </span>
        </p>
        <p
            v-if="isPlayer"
            class="combatant-info__stat-line"
            @mouseenter="onInfoTooltipEnter($event, statTooltips.manaDiamonds)"
            @mousemove="onInfoTooltipMove"
            @mouseleave="onInfoTooltipLeave"
        >
            <span
                class="suit-symbol suit-symbol--mana-diamonds"
                title="Mana Diamonds"
                v-html="diamondSuitSvgInner"
            ></span>
            {{ (combatant as Player).manaDiamonds }}
        </p>
        <p
            v-if="combatant.dodge > 0"
            class="combatant-info__stat-line"
            @mouseenter="onInfoTooltipEnter($event, statTooltips.dodge)"
            @mousemove="onInfoTooltipMove"
            @mouseleave="onInfoTooltipLeave"
        >
            Dodge: {{ combatant.dodge }}
        </p>
        <p
            class="combatant-info__stat-line combatant-info__block-row"
            @mouseenter="onInfoTooltipEnter($event, statTooltips.block)"
            @mousemove="onInfoTooltipMove"
            @mouseleave="onInfoTooltipLeave"
        >
            <span v-html="BLOCK_STAT_SYMBOL_HTML"></span> {{ combatant.block }}
            <span
                v-if="pendingEndTurnBlockLoss != null && pendingEndTurnBlockLoss > 0"
                class="combatant-info__end-turn-preview-inline"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.pendingEndTurnBlockLoss)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            > (-{{ pendingEndTurnBlockLoss
                }}<span
                    class="suit-symbol suit-symbol--block"
                    aria-hidden="true"
                    v-html="BLOCK_SHIELD_SVG_INNER"
                ></span>)
            </span>
        </p>
        <div
            v-if="isPlayer && playerCombatStatuses.length"
            class="combatant-info__statuses"
        >
            <h3>Statuses</h3>
            <ul class="combatant-info__statuses-list">
                <li
                    v-for="(s, i) in playerCombatStatuses"
                    :key="`${s.id}-${i}`"
                    class="combatant-info__status-line"
                    @mouseenter="onInfoTooltipEnter($event, getCombatStatusTooltip(s.id))"
                    @mousemove="onInfoTooltipMove"
                    @mouseleave="onInfoTooltipLeave"
                >
                    {{ combatStatusLabels[s.id] }} ({{ s.turnsRemaining }})
                </li>
            </ul>
        </div>
        <div
            v-if="isEnemy && enemyCombatStatuses.length"
            class="combatant-info__statuses"
        >
            <h3>Statuses</h3>
            <ul class="combatant-info__statuses-list">
                <li
                    v-for="(s, i) in enemyCombatStatuses"
                    :key="`${s.id}-${i}`"
                    class="combatant-info__status-line"
                    @mouseenter="onInfoTooltipEnter($event, getCombatStatusTooltip(s.id))"
                    @mousemove="onInfoTooltipMove"
                    @mouseleave="onInfoTooltipLeave"
                >
                    {{ combatStatusLabels[s.id] }} ({{ s.turnsRemaining }})
                </li>
            </ul>
        </div>
        <p class="combatant-info__stats-gap"></p>
        <template v-if="isPlayer">
            <p
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.attackPlayer)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Attack: {{ (combatant as Player).attack }}
            </p>
            <p
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.armorPlayer)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Armor: {{ combatant.armor }}
            </p>
            <p
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.agility)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Agility: {{ (combatant as Player).agility }}
            </p>
            <p
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.acumen)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Acumen: {{ (combatant as Player).acumen }}
            </p>
            <p
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.appeal)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Appeal: {{ (combatant as Player).appeal }}
            </p>
            <p
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.koallarbucks)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                {{ (combatant as Player).koallarbucks }} 💵
            </p>
            <p v-if="showBytecoins">Bytecoins: {{ (combatant as Player).bytecoins }}</p>
            <div v-if="playerCardifacts.length" class="combatant-info__cardifacts">
                <h3>Cardifacts</h3>
                <ul class="combatant-info__cardifacts-list">
                    <li
                        v-for="c in playerCardifacts"
                        :key="c.id"
                        class="combatant-info__cardifact-item"
                        @mouseenter="onInfoTooltipEnter($event, c.description)"
                        @mousemove="onInfoTooltipMove"
                        @mouseleave="onInfoTooltipLeave"
                    >
                        {{ c.name }}
                    </li>
                </ul>
            </div>
        </template>
        <template v-else-if="isEnemy">
            <p
                v-if="(combatant as Enemy).attack !== 0"
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.attackEnemy)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Attack: {{ (combatant as Enemy).attack }}
            </p>
            <p
                v-if="combatant.armor !== 0"
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.armorEnemy)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Armor: {{ combatant.armor }}
            </p>
            <p
                v-if="(combatant as Enemy).agility !== 0"
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.agilityEnemy)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Agility: {{ (combatant as Enemy).agility }}
            </p>
            <p
                v-if="(combatant as Enemy).acumen !== 0"
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.acumenEnemy)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Acumen: {{ (combatant as Enemy).acumen }}
            </p>
            <p
                v-if="(combatant as Enemy).appeal !== 0"
                class="combatant-info__stat-line"
                @mouseenter="onInfoTooltipEnter($event, statTooltips.appealEnemy)"
                @mousemove="onInfoTooltipMove"
                @mouseleave="onInfoTooltipLeave"
            >
                Appeal: {{ (combatant as Enemy).appeal }}
            </p>
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
                :pending-end-turn-hp-loss="pendingEndTurnSummonHpLosses?.[index] ?? null"
            />
        </div>
        <Teleport to="body">
            <div
                v-if="infoTooltipText"
                ref="infoTooltipRef"
                class="cursor-tooltip"
                :class="{ 'cursor-tooltip--visible': showInfoTooltip }"
                :style="infoTooltipStyle"
            >
                <span v-html="formatStatSymbols(infoTooltipText)"></span>
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
        font-family: var(--font-game-mono);
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

    .combatant-info__stat-line {
        cursor: help;
    }

    .combatant-info__health-row .combatant-info__end-turn-preview-inline,
    .combatant-info__block-row .combatant-info__end-turn-preview-inline {
        color: #a63;
        font-weight: 600;
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

    .combatant-info__status-line {
        cursor: help;
    }

    </style>
