<script setup lang="ts">
    import { computed } from 'vue';
    import type { DamageNumber } from '../composables/useDamageNumbers';

    const props = defineProps<{
        number: DamageNumber;
    }>();

    const displayValue = computed(() => {
        const sign = props.number.type === 'damage' || props.number.type === 'block-loss' ? '-' : '+';
        return `${sign}${props.number.value}`;
    });

    const numberClass = computed(() => {
        if (props.number.type === 'damage' || props.number.type === 'heal') {
            return 'health-number';
        }
        return 'block-number';
    });
</script>

<template>
    <div :class="['floating-number', numberClass]">
        {{ displayValue }}
    </div>
</template>

<style scoped>
    .floating-number {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 32px;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        animation: float-up 2s ease-out forwards;
    }

    .health-number {
        color: red;
        animation: float-up 2s ease-out forwards, flash-red 0.3s ease-out;
    }

    .block-number {
        color: gray;
        animation: float-up 2s ease-out forwards, flash-gray 0.3s ease-out;
    }

    @keyframes float-up {
        0% {
            transform: translate(-50%, -50%);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -150%);
            opacity: 0;
        }
    }

    @keyframes flash-red {
        0%, 100% {
            background-color: transparent;
        }
        50% {
            background-color: rgba(255, 0, 0, 0.3);
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        }
    }

    @keyframes flash-gray {
        0%, 100% {
            background-color: transparent;
        }
        50% {
            background-color: rgba(128, 128, 128, 0.3);
            box-shadow: 0 0 20px rgba(128, 128, 128, 0.5);
        }
    }
</style>

