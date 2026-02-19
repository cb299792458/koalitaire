<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type Player from '../models/Player';
    import FloatingNumber from './FloatingNumber.vue';
    import SummonDisplay from './SummonDisplay.vue';
    import useDamageNumbers from '../composables/useDamageNumbers';

    const props = withDefaults(
        defineProps<{
            player: Player | null;
            showBytecoins?: boolean;
        }>(),
        { showBytecoins: false }
    );

    const CURSOR_OFFSET = 12;
    const tooltipX = ref(0);
    const tooltipY = ref(0);
    const showTooltip = ref(false);
    let showDelay: ReturnType<typeof setTimeout> | null = null;

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

    const { playerNumbers } = useDamageNumbers();

    const flashClass = computed(() => {
        if (playerNumbers.value.length === 0) return '';
        const latest = playerNumbers.value[playerNumbers.value.length - 1];
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
    <div :class="['player-info', flashClass]" v-if="props.player">
        <FloatingNumber
            v-for="number in playerNumbers"
            :key="number.id"
            :number="number"
        />
        <h2>{{ props.player.name }}</h2>
        <div
            class="portrait-tooltip-wrapper"
            @mousemove="onPortraitMouseMove"
            @mouseenter="onPortraitMouseEnter"
            @mouseleave="onPortraitMouseLeave"
        >
            <img :src="props.player.portrait" alt="Player Portrait" width="100%"/>
            <Teleport to="body">
                <div
                    class="cursor-tooltip"
                    :class="{ 'cursor-tooltip--visible': showTooltip }"
                    :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
                >
                    {{ props.player.tooltip }}
                </div>
            </Teleport>
        </div>
        <p>Health: {{ props.player.health }} / {{ props.player.maxHealth }}</p>
        <p>Block: {{ props.player.block }}</p>
        <p>Mana Diamonds: {{ props.player.manaDiamonds }}</p>
        
        <p>Appeal: {{ props.player.appeal }}</p>
        <p>Attack: {{ props.player.attack }}</p>
        <p>Armor: {{ props.player.armor }}</p>
        <p>Agility: {{ props.player.agility }}</p>
        <p>Arcane: {{ props.player.arcane }}</p>
        
        <p>{{ props.player.gold }} 🍃</p>
        <p v-if="props.showBytecoins">Bytecoins: {{ props.player.bytecoins }}</p>
        <p>Deck Size: {{ props.player.deck.length }}</p>
        
        <div class="summons-list" v-if="props.player.summons.length">
            <h3>Summons</h3>
            <SummonDisplay
                v-for="(summon, index) in props.player.summons"
                :key="index"
                :summon="summon"
            />
        </div>
    </div>
</template>
