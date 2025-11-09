<script setup lang="ts">
    import Card from '../models/Card';
    import CardStack from './CardStack.vue';
    import useGameState from '../composables/useGameState';
    import { AREAS, type Area } from '../models/Areas';
    import ModalManager from './ModalManager.vue';
    import { onMounted, watch } from 'vue';
    import { openModal } from '../stores/modalStore';
    import PlayerInfo from './PlayerInfo.vue';
    import EnemyInfo from './EnemyInfo.vue';
    import makeScenario from '../game/makeScenario';
    import type Player from '../models/Player';

    const scenario = makeScenario();

    const {
        selectedCard,
        deck,
        compost,
        hand,
        tableau,
        manaPools,
        updateGameState,
        player,
        enemy,
        startCombat,
        endTurn,
    } = useGameState();
        
    watch(() => player.value?.level, () => {
        if (!player.value) return;
        if (!scenario[player.value.level]) return;

        enemy.value = scenario[player.value.level]!.enemy;
        startCombat();
    })
        
    function onClick(payload: {
        card: Card | null;
        area: Area;
        arrayIndex?: number;
        cardIndex: number;
    }) {
        const { card, area, arrayIndex, cardIndex } = payload;
        updateGameState(
            card,
            area,
            arrayIndex,
            cardIndex,
        );
    }

    onMounted(() => {
        openModal(
            'start',
            { onSelect: (newPlayer: Player) => player.value = newPlayer },
            true, // keepOpen
        );
    })
</script>

<template>
    <div class="game-page" @click="onClick({ card: null, area: AREAS.Board, cardIndex: -1 })">
        <ModalManager/>
        <div class="game-header">
            <h1>Koalitaire Game</h1>
        </div>

        <div class="game-main">
            <div class="game-left">
                <h1>Player</h1>
                <PlayerInfo :player="player" />
            </div>

            <div class="game-middle">
                <div class="cards-top">
                    <div class="cards-stock">
                        <CardStack
                            :cards="deck"
                            :name="AREAS.Deck"
                            @click="onClick"
                        />
                        <CardStack
                            :cards="compost"
                            :name="AREAS.Compost"
                            @click="onClick"
                        />
                        <CardStack
                            :cards="[]"
                            :name="'Cast Card'"
                            @click="onClick"
                        />
                        <CardStack
                            :cards="[]"
                            :name="'Burn Card'"
                            @click="onClick"
                        />
                    </div>

                    <div class="mana-pools">
                        <CardStack
                            v-for="([_suit, cards], index) in Object.entries(manaPools)"
                            :key="index"
                            :cards="cards"
                            :name="AREAS.ManaPools"
                            :arrayIndex="index"
                            @mousedown.prevent
                            @click="onClick"
                        />
                    </div>
                </div>

                <div class="cards-bottom">
                    <div class="tableau">
                        <CardStack
                            v-for="(cards, index) in tableau"
                            :key="index"
                            :cards="cards"
                            :name="AREAS.Tableau"
                            layout="vertical"
                            :selectedCard="selectedCard"
                            :arrayIndex="index"
                            @mousedown.prevent
                            @click="onClick"
                        />
                    </div>
                </div>
            </div>

            <div class="game-right">
                <h1>Enemy</h1>
                <EnemyInfo :enemy="enemy" />
            </div>
        </div>

        <div class="game-bottom">
            <div class="cards-hand">
                <CardStack
                    :cards="hand"
                    :name="AREAS.Hand"
                    layout="horizontal"
                    :selectedCard="selectedCard"
                    @click="onClick"
                />
            </div>
            <button @click="endTurn">End Turn</button>
        </div>
    </div>
</template>

