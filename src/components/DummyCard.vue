<script setup lang="ts">
    defineProps<{
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
</script>

<template>
    <div
        class="card-stack-empty"
        :class="{
            'castable-highlight': highlighted && highlightType === 'cast',
            'burnable-highlight': highlighted && highlightType === 'burn'
        }"
        :style="style"
        @click.stop="emit('click')"
    >
        <img
            v-if="manaPoolIcon"
            :src="manaPoolIcon"
            :alt="manaPoolIconAlt || ''"
            class="mana-pool-icon"
            :class="manaPoolSuitClass"
        />
        <template v-else>
            {{ label }}
        </template>
    </div>
</template>
