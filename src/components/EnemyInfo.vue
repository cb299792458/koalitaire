<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type Enemy from '../models/Enemy';
    import FloatingNumber from './FloatingNumber.vue';
    import SummonDisplay from './SummonDisplay.vue';
    import useDamageNumbers from '../composables/useDamageNumbers';

    const props = defineProps<{
        enemy: Enemy | null;
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

    function onPortraitMouseMove(e: MouseEvent) {
        tooltipX.value = e.clientX + CURSOR_OFFSET;
        tooltipY.value = e.clientY + CURSOR_OFFSET;
    }

    function onPortraitMouseEnter(e: MouseEvent) {
        onPortraitMouseMove(e);
        showDelay = setTimeout(() => {
            showTooltip.value = true;
            showDelay = null;
        }, 800);
    }

    function onPortraitMouseLeave() {
        if (showDelay !== null) {
            clearTimeout(showDelay);
            showDelay = null;
        }
        showTooltip.value = false;
    }

    const { enemyNumbers } = useDamageNumbers();

    const flashClass = computed(() => {
        if (enemyNumbers.value.length === 0) return '';
        const latest = enemyNumbers.value[enemyNumbers.value.length - 1];
        if (!latest) return '';
        if (latest.type === 'damage' || latest.type === 'heal') {
            return 'flash-red';
        }
        if (latest.type === 'block-gain' || latest.type === 'block-loss') {
            return 'flash-gray';
        }
        return '';
    });
</script>

<template>
    <div :class="['enemy-info', flashClass]" v-if="props.enemy">
        <FloatingNumber
            v-for="number in enemyNumbers"
            :key="number.id"
            :number="number"
        />
        <h2>{{ props.enemy.name }}</h2>
        <div
            class="portrait-tooltip-wrapper"
            @mousemove="onPortraitMouseMove"
            @mouseenter="onPortraitMouseEnter"
            @mouseleave="onPortraitMouseLeave"
        >
            <img :src="props.enemy.portrait" alt="Enemy Portrait" width="100%"/>
            <Teleport to="body">
                <div
                    ref="tooltipRef"
                    class="cursor-tooltip"
                    :class="{ 'cursor-tooltip--visible': showTooltip }"
                    :style="tooltipStyle"
                >
                    {{ props.enemy.tooltip }}
                </div>
            </Teleport>
        </div>
        <p>Health: {{ props.enemy.health }} / {{ props.enemy.maxHealth }}</p>
        <p>Block: {{ props.enemy.block }}</p>
        
        <p>Attack: {{ props.enemy.attack }}</p>
        <p>Armor: {{ props.enemy.armor }}</p>

        <br/>
        <p>Actions: {{ props.enemy.actions }}</p>
        <p v-for="(action, index) in props.enemy.impendingActions" :key="index">
            {{ action.name }}: {{ action.description }}
        </p>

        <div class="summons-list" v-if="props.enemy.summons.length">
            <h3>Summons</h3>
            <SummonDisplay
                v-for="(summon, index) in props.enemy.summons"
                :key="index"
                :summon="summon"
            />
        </div>
    </div>
</template>
