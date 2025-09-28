<script setup lang="ts">
import type Card from '../Card';
import CardView from './CardView.vue';

const suits: string[] = ["♥️", "♦️", "♣️", "♠️"];

const deck: Card[] = [];
const recycle: Card[] = [];
const trash: Card[] = [];
const manaPool: Card[][] = Array.from({ length: 4 }, () => []);
const tableau: Card[][] = Array.from({ length: 7 }, () => []);

for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
        deck.push({ suit, value, revealed: true });
    }
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
                        <div class="card-pile deck">deck</div>
                        <div class="card-pile recycle">recycle</div>
                        <div class="card-pile trash">trash</div>
                    </div>

                    <div class="mana-pool">
                        <div
                            class="card-pile mana-pile"
                            v-for="n in 4"
                            :key="n"
                        >
                            Mana {{ n }}
                        </div>
                    </div>
                </div>

                <div class="cards-bottom">
                    <div
                        class="tableau"
                        v-for="(card, index) in deck.slice(0, 7)"
                        :key="index"
                    >
                        <CardView :card="card" />
                    </div>  
                </div>
            </div>

            <div class="game-right">
                <h1>Enemy</h1>
            </div>
        </div>

        <div class="game-bottom">
            <h1>Hand and Stuff</h1>
            <div class="cards-hand">
                <div class="card-pile hand" v-for="n in 7" :key="n">
                    Hand {{ n }}
                </div>
            </div>
        </div>
    </div>
</template>

