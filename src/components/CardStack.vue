<script setup lang="ts">
    import CardView from './SingleCard.vue';
    import Card from '../Card';

    const props = defineProps<{ cards: Card[], name: string, layout?: string }>();

    function cardPosition(index: number) {
        return {
            position: 'absolute',
            top: props.layout === 'vertical' ? `${index * 20}px` : `${index * 0.25}px`,
            left: props.layout === 'vertical' ? '0px' : `${index * 0.25}px`,
            zIndex: index + 1
        };
    }
</script>

<template>
    <div class="card-stack {{ layout || 'pile' }}">
        <div
            class="card-stack-empty"
        >
            {{ name }}
        </div>
        <CardView v-for="(card, index) in cards" 
            :key="index" 
            :card="card"
            :style="cardPosition(index)"
        />
    </div>
</template>
