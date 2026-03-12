<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    label?: string;
    manaPoolIcon?: string;
    manaPoolIconAlt?: string;
    manaPoolSuitClass?: string;
    highlighted?: boolean;
    highlightType?: 'burn' | 'cast';
    style?: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'click'): void;
}>();

const highlightClass = computed(() =>
    props.highlighted && props.highlightType
        ? `${props.highlightType}able-highlight`
        : ''
);
</script>

<template>
    <div
        class="card-stack-empty clickable"
        :class="highlightClass"
        :style="style"
        @click.stop="emit('click')"
    >
        <img
            v-if="manaPoolIcon"
            :src="manaPoolIcon"
            :alt="manaPoolIconAlt ?? ''"
            class="mana-pool-icon"
            :class="manaPoolSuitClass"
        />
        <template v-else>
            {{ label }}
        </template>
    </div>
</template>

<style scoped>
.card-stack-empty {
    width: 120px;
    aspect-ratio: 5 / 7;
    background-color: #f5f0d0;
    opacity: 1;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    border: 1px solid black;
    overflow: hidden;
    box-sizing: border-box;
}

.mana-pool-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    display: block;
}

.mana-pool-icon.suit-wood { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(2000%) hue-rotate(90deg) brightness(70%) contrast(120%); }
.mana-pool-icon.suit-fire { filter: brightness(0) saturate(100%) invert(16%) sepia(94%) saturate(7151%) hue-rotate(358deg) brightness(99%) contrast(113%); }
.mana-pool-icon.suit-water { filter: brightness(0) saturate(100%) invert(48%) sepia(99%) saturate(2476%) hue-rotate(182deg) brightness(95%) contrast(86%); }
.mana-pool-icon.suit-metal { filter: brightness(0) saturate(0%) invert(50%) grayscale(100%); }
.mana-pool-icon.suit-earth { filter: brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(1200%) hue-rotate(30deg) brightness(70%) contrast(110%); }
</style>
