<script setup lang="ts">
    import Card from '../models/Card';
    import CardStack from './CardStack.vue';
    import { useCombat } from '../composables/useCombat';
    import { AREAS, type Area } from '../models/Areas';
    import ModalManager from './ModalManager.vue';
    import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
    import { openModal } from '../stores/modalStore';
    import PlayerInfo from './PlayerInfo.vue';
    import EnemyInfo from './EnemyInfo.vue';
    import makeScenario from '../game/makeScenario';
    import type Player from '../models/Player';

    const scenario = makeScenario();

    const combat = useCombat(); // useCombat always returns a Combat instance
        
    // Create refs for player and enemy for template reactivity  
    const player = ref(combat.player);
    const enemy = ref(combat.enemy);
    
    const deck = combat.deck;
    const compost = combat.compost;
    const hand = combat.hand;
    const tableau = computed(() => combat.tableau.getCardsArrays());
    const manaPools = combat.manaPools;
    const selectedCard = computed(() => combat.selectedCard);
    
    function startCombatForPlayer(newPlayer: Player) {
        if (!scenario[newPlayer.level]) return;
        const levelEnemy = scenario[newPlayer.level]!.enemy;
        combat.start(newPlayer, levelEnemy);
        // Update refs after start
        player.value = combat.player;
        enemy.value = combat.enemy;
    }
    
    watch(() => player.value?.level, () => {
        if (!player.value) return;
        startCombatForPlayer(player.value);
    })
        
    function onClick(payload: {
        card: Card | null;
        area: Area;
        arrayIndex?: number;
        cardIndex: number;
    }) {
        const { card, area, arrayIndex, cardIndex } = payload;
        combat.updateGameState(
            card,
            area,
            arrayIndex,
            cardIndex,
        );
    }

    onMounted(() => {
        openModal(
            'start',
            { onSelect: (newPlayer: Player) => {
                player.value = newPlayer;
                startCombatForPlayer(newPlayer);
            }},
            true, // keepOpen
        );
    })

    const scale = ref(0.8);
    const designWidth = 1920
    const designHeight = 1080
    function updateScale() {
        scale.value = Math.min(
            window.innerWidth / designWidth,
            window.innerHeight / designHeight
        );
    }
    onMounted(() => {
        updateScale()
        window.addEventListener('resize', updateScale)
        window.addEventListener('focus', updateScale)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateScale)
        window.removeEventListener('focus', updateScale)
    })
</script>

<template>
    <div class="game-page">
        <div class="scale-wrapper">
            <div class="scale-container" :style="{ transform: `scale(${scale})` }">
                <ModalManager/>
        
                <div class="combat-screen" @click="onClick({ card: null, area: AREAS.Board, cardIndex: -1 })">
                    <div class="combat-top">
                        <div class="combat-left">
                            <h1>Player</h1>
                            <PlayerInfo :player="player" />
                        </div>
            
                        <div class="combat-middle">
                            <div class="cards-top">
                                <div class="cards-stock">
                                    <CardStack
                                        :cards="deck.cards"
                                        :name="AREAS.Deck"
                                        @click="onClick"
                                    />
                                    <CardStack
                                        :cards="compost.cards"
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
                                        v-for="([_suit, manaPool], index) in Object.entries(manaPools)"
                                        :key="index"
                                        :cards="(manaPool as any).cards"
                                        :name="AREAS.ManaPools"
                                        :arrayIndex="index"
                                        @mousedown.prevent
                                        @click="onClick"
                                    />
                                </div>
                            </div>
            
                            <div class="tableau">
                                <CardStack
                                    v-for="(cards, index) in tableau"
                                    :key="index"
                                    :cards="cards"
                                    :name="AREAS.Tableau"
                                    layout="vertical"
                                    :selectedCard="selectedCard"
                                    :arrayIndex="index as number"
                                    @mousedown.prevent
                                    @click="onClick"
                                />
                            </div>
                        </div>
            
                        <div class="combat-right">
                            <h1>Enemy</h1>
                            <EnemyInfo :enemy="enemy" />
                        </div>
                    </div>
            
                    <div class="combat-bottom">
                        <div class="cards-hand">
                            <CardStack
                                :cards="hand.cards"
                                :name="AREAS.Hand"
                                layout="horizontal"
                                :selectedCard="selectedCard"
                                @click="onClick"
                            />
                        </div>
                        <button @click="combat.endTurn" id="end-turn-button">End Turn</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

