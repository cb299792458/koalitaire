<script setup lang="ts">
import { reactive, ref, type Reactive, type Ref } from 'vue';
import type Card from '../Card';
import CardStack from './CardStack.vue';

const suits: string[] = ["♥️", "♦️", "♣️", "♠️"];

const deck: Ref<Card[]> = ref([]);
const recycle: Ref<Card[]> = ref([]);
const trash: Ref<Card[]> = ref([]);
const manaPool: Reactive<Card[][]> = reactive(Array.from({ length: 5 }, () => []));
const tableau: Reactive<Card[][]> = reactive(Array.from({ length: 7 }, () => []));

for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
        deck.value.push({ suit, value, revealed: false });
    }
}

function moveTo(target: Card[]) {
    if (deck.value.length === 0) return; // nothing to move
    const card = deck.value.pop()!;
    card.revealed = true; // optionally reveal the card
    target.push(card);
}

</script>

<template>
    <div class="game-page">
        <div class="game-header">
            <h1>Koalitaire Game</h1>
        </div>

        <div class="game-main">
            <div class="game-left">
                <h1>Player</h1>
            </div>

            <div class="game-middle">
                <div class="cards-top">
                    <div class="cards-stock">
                        <CardStack
                            :cards="deck"
                            name="deck"
                        />
                        <CardStack
                            :cards="recycle"
                            name="recycle"
                            @mousedown.prevent
                            @click="moveTo(recycle)"
                        />
                        <CardStack
                            :cards="trash"
                            name="trash"
                            @mousedown.prevent
                            @click="moveTo(trash)"
                        />
                    </div>

                    <div class="mana-pool">
                        <CardStack
                            v-for="(pool, index) in manaPool"
                            :key="index"
                            :cards="pool"
                            :name="'Mana Pool ' + (index + 1)"
                            @mousedown.prevent
                            @click="moveTo(pool)"
                        />
                    </div>
                </div>

                <div class="cards-bottom">
                    <CardStack
                        v-for="(cards, index) in tableau"
                        :key="index"
                        :cards="cards"
                        :name="'Tableau ' + (index + 1)"
                        layout="vertical"
                        @mousedown.prevent
                        @click="moveTo(cards)"
                    />
                </div>
            </div>

            <div class="game-right">
                <h1>Enemy</h1>
            </div>
        </div>

        <div class="game-bottom">
            <h1>Hand and Stuff</h1>
            <div class="cards-hand">
                <div class="card-stack-empty" v-for="n in 7" :key="n">
                    Hand {{ n }}
                </div>
            </div>
        </div>
    </div>
</template>

