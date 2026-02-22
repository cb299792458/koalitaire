<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type Summon from '../models/Summon';

    const props = defineProps<{
        summon: Summon;
    }>();

    const CURSOR_OFFSET = 12;
    const TOOLTIP_EDGE_PADDING = 20;
    const tooltipX = ref(0);
    const tooltipY = ref(0);
    const tooltipRef = ref<HTMLElement | null>(null);
    const showTooltip = ref(false);
    let showDelay: ReturnType<typeof setTimeout> | null = null;

    const tooltipStyle = computed(() => {
        const x = tooltipX.value;
        const y = tooltipY.value;
        const height = tooltipRef.value?.offsetHeight ?? 80;
        const wouldOverflowBottom = y + height > window.innerHeight - TOOLTIP_EDGE_PADDING;
        return {
            left: x + 'px',
            top: wouldOverflowBottom ? (y - height - TOOLTIP_EDGE_PADDING) + 'px' : y + 'px',
        };
    });

    function onMouseMove(e: MouseEvent) {
        tooltipX.value = e.clientX + CURSOR_OFFSET;
        tooltipY.value = e.clientY + CURSOR_OFFSET;
    }

    function onMouseEnter(e: MouseEvent) {
        onMouseMove(e);
        showDelay = setTimeout(() => {
            showTooltip.value = true;
            showDelay = null;
        }, 800);
    }

    function onMouseLeave() {
        if (showDelay !== null) {
            clearTimeout(showDelay);
            showDelay = null;
        }
        showTooltip.value = false;
    }
</script>

<template>
    <div
        class="summon-display"
        @mousemove="onMouseMove"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <span class="summon-name">{{ props.summon.name }}</span>
        <span class="summon-description">{{ props.summon.description }}</span>
        <span class="summon-hp">{{ props.summon.hp }} / {{ props.summon.maxhp }}</span>
        <span v-if="props.summon.power > 0" class="summon-power">⚔ {{ props.summon.power }}</span>
        <Teleport to="body">
            <div
                ref="tooltipRef"
                class="cursor-tooltip"
                :class="{ 'cursor-tooltip--visible': showTooltip }"
                :style="tooltipStyle"
            >
                {{ props.summon.tooltip }}
            </div>
        </Teleport>
    </div>
</template>
