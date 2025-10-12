<script setup lang="ts">
    import Card from '../models/Card';
    import CardStack from './CardStack.vue';
    import useGameState from '../composables/useGameState';
    import { AREAS, type Area } from '../models/Areas';
    import ModalManager from './ModalManager.vue';
    import { onMounted, ref, type Ref } from 'vue';
    import type Player from '../models/Player';
    import { openModal } from '../stores/modalStore';
    import PlayerInfo from './PlayerInfo.vue';

    const player: Ref<Player | null> = ref(null);
    const setPlayer = (newPlayer: Player) => {
        player.value = newPlayer;
    };
        
    const {
        selectedCard,
        deck,
        compost,
        // trash,
        hand,
        tableau,
        manaPools,
        updateGameState,
        mana,
    } = useGameState();

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
        console.log(player)
        openModal(
            'start',
            { setPlayer },
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
                        <!-- <CardStack
                            :cards="trash"
                            :name="AREAS.Trash"
                            @mousedown.prevent
                        /> -->
                        <CardStack
                            :cards="[]"
                            :name="'Cast Card'"
                            @mousedown.prevent
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
                    <div class="mana-row">
                        <p>Mana: </p>
                        <div v-for="(amount, suit) in mana" :key="suit" class="mana-suit">
                            <span>{{ suit }}: {{ amount }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="game-right">
                <h1>Enemy</h1>
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
        </div>
    </div>
</template>

