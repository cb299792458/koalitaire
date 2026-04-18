<script setup lang="ts">
    import { computed, ref } from 'vue'
    import type Summon from '../models/Summon'
    import { formatStatSymbols } from '../utils/damageSymbol'
    import { clubSuitSvgInner, heartSuitSvgInner } from '../utils/suitUiSymbols'

    withDefaults(
        defineProps<{
            summon: Summon
            /** Extra ♥ loss on this summon if End Turn resolved now (0 = hide). */
            pendingEndTurnHpLoss?: number | null
        }>(),
        { pendingEndTurnHpLoss: null }
    )

    const CURSOR_OFFSET = 12
    const TOOLTIP_EDGE_PADDING = 20
    const TOOLTIP_DELAY = 800

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

    function onMouseMove(e: MouseEvent) {
        tooltipX.value = e.clientX + CURSOR_OFFSET
        tooltipY.value = e.clientY + CURSOR_OFFSET
    }

    function onMouseEnter(e: MouseEvent) {
        onMouseMove(e)
        showDelay = setTimeout(() => {
            showTooltip.value = true
            showDelay = null
        }, TOOLTIP_DELAY)
    }

    function onMouseLeave() {
        if (showDelay !== null) {
            clearTimeout(showDelay)
            showDelay = null
        }
        showTooltip.value = false
    }
</script>

<template>
    <div
        class="summon-display"
        @mousemove="onMouseMove"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <span class="summon-name">{{ summon.name }}</span>
        <span class="summon-description" v-html="formatStatSymbols(summon.description)"></span>
        <span class="summon-stats">
            <span
                v-if="summon.damage"
                class="suit-symbol suit-symbol--damage"
                title="Damage dealt to the enemy by this summon each turn."
                v-html="clubSuitSvgInner"
            ></span>
            <span v-if="summon.damage" class="summon-num"> {{ summon.damage }} </span>
            <span
                class="suit-symbol suit-symbol--health"
                title="When this reaches 0, the summon is removed."
                v-html="heartSuitSvgInner"
            ></span>
            <span class="summon-num">{{ summon.hp }}</span>
            <template v-if="pendingEndTurnHpLoss != null && pendingEndTurnHpLoss > 0">
                <span class="summon-pending-loss">
                    (-{{ pendingEndTurnHpLoss
                    }}<span
                        class="suit-symbol suit-symbol--health"
                        aria-hidden="true"
                        v-html="heartSuitSvgInner"
                    ></span>)
                </span>
            </template>
        </span>
        <Teleport to="body">
            <div
                ref="tooltipRef"
                class="cursor-tooltip"
                :class="{ 'cursor-tooltip--visible': showTooltip }"
                :style="tooltipStyle"
            >
                <span v-html="formatStatSymbols(summon.tooltip)"></span>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
        .summon-display {
        position: relative;
        display: flex;
        flex-direction: column;
        padding: 6px 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        font-size: 12px;
    }

    .summon-name {
        font-weight: bold;
    }

    .summon-description {
        color: #444;
        font-size: 11px;
        font-style: italic;
    }

    .summon-stats {
        font-size: 14px;
    }

    .summon-num {
        color: #000;
    }

    .summon-pending-loss {
        margin-left: 4px;
        font-size: 12px;
        color: #a63;
        font-weight: 600;
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
</style>
