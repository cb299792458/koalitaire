<script setup lang="ts">
    import Card, { Suits } from '../models/Card';
    import CardStack from './CardStack.vue';
    import { useCombat } from '../composables/useCombat';
    import { AREAS, type Area } from '../models/Areas';
    import ModalManager from './ModalManager.vue';
    import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
    import { openModal, closeModal } from '../stores/modalStore';
    import PlayerInfo from './PlayerInfo.vue';
    import EnemyInfo from './EnemyInfo.vue';
    import makeScenario from '../game/makeScenario';
    import type Player from '../models/Player';
    import ManaPool from '../models/ManaPool';

    const scenario = makeScenario();

    const combat = useCombat(); // useCombat always returns a Combat instance
    
    // Set up enemy defeat callbacks
    combat.onEnemyDefeated = () => {
        // Modal will be shown automatically
    };
    
    combat.onEnemyDefeatedContinue = () => {
        closeModal();
        if (!player.value) return;
        startCombatForPlayer(player.value);
    };
        
    // Create computed refs for player and enemy for template reactivity  
    const player = computed(() => combat.player);
    const enemy = computed(() => combat.enemy);
    
    const deck = combat.deck;
    const compost = combat.compost;
    const trash = combat.trash;
    const hand = combat.hand;
    const tableau = computed(() => combat.tableau.getCardsArrays());
    const manaPools = combat.manaPools;
    const selectedCard = computed(() => combat.selectedCard);
    
    // Make mana pools reactive by accessing them in a computed
    const allManaPoolCounts = computed(() => {
        return Object.values(combat.manaPools).map(pool => pool.cards.length);
    });

    const canMoveToManaPools = computed(() => combat.getCardsMovableToManaPools().length > 0);

    const deckCount = computed(() => combat.deck.cards.length);
    const reshuffles = computed(() => combat.reshuffles);
    
    const isCompostHighlighted = computed(() => {
        // Use the reactive selectedCard computed
        const card = selectedCard.value;
        if (!card || !card.revealed) return false;
        
        // Check if card is castable (uses manaCrystals)
        return combat.isSelectedCardPlayable();
    });
    
    const manaCrystalsCost = computed(() => {
        const cost = combat.getManaCrystalsNeededForCast();
        // Only show cost if card is castable (player has enough mana crystals)
        if (cost > 0 && combat.isSelectedCardPlayable()) {
            return cost;
        }
        return null;
    });
    
    const compostHighlightType = computed(() => {
        const cost = combat.getManaCrystalsNeededForCast();
        // If cost is 0, use burn highlight (red), otherwise use cast highlight (blue)
        return cost === 0 ? 'burn' : 'cast';
    });
    
    const showCastSpellText = computed(() => {
        const card = selectedCard.value;
        if (!card || !card.revealed) return false;
        // Show "Cast Spell" if card is castable
        return combat.isSelectedCardPlayable();
    });
    
    // Get the suit index for the selected card's mana pool highlighting
    const highlightedManaPoolIndex = computed(() => {
        const card = selectedCard.value;
        if (!card || !card.revealed) return -1;
        
        // Spell cards cannot be burned
        if (card.isSpell) {
            return -1;
        }
        
        const { rank, suit } = card;
        const manaPool = combat.manaPools[suit];
        if (!manaPool) return -1;
        
        // Access allManaPoolCounts to ensure reactivity
        void allManaPoolCounts.value;
        
        // Check if rank is one more than mana pool count (required for burning)
        // Card can be placed if rank === poolCount + 1
        const poolCount = manaPool.cards.length;
        if (poolCount !== rank - 1) {
            return -1;
        }
        
        // Card must be from hand or last in tableau
        const handIndex = combat.hand.cards.indexOf(card);
        if (handIndex === -1) {
            // Check if it's the last card in a tableau column
            const tableauColumns = combat.tableau.getColumns();
            let isLastInTableau = false;
            for (const column of tableauColumns) {
                if (column.cards.length > 0) {
                    const lastCard = column.cards[column.cards.length - 1];
                    if (lastCard === card) {
                        isLastInTableau = true;
                        break;
                    }
                }
            }
            if (!isLastInTableau) return -1;
        }
        
        // Find the index of this suit in the Suits array
        const suitIndex = Suits.indexOf(suit);
        return suitIndex;
    });
    
    // Get the tableau column indices that can accept the selected card
    const highlightedTableauIndices = computed(() => {
        // Access tableau to ensure reactivity
        void tableau.value;
        return combat.canPlaceSelectedCardInTableau();
    });
    
    function startCombatForPlayer(newPlayer: Player) {
        if (!scenario[newPlayer.level]) return;
        const levelEnemy = scenario[newPlayer.level]!.enemy;
        combat.start(newPlayer, levelEnemy);
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

    function onMoveToManaClick() {
        combat.moveAllPossibleToManaPools();
    }

    onMounted(() => {
        openModal(
            'start',
            { onSelect: (newPlayer: Player) => {
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
                                <div class="cards-top-left">
                                    <div class="deck-wrapper" :title="`${deckCount} cards left`">
                                        <CardStack
                                            :cards="deck.cards"
                                            :name="AREAS.Deck"
                                            layout="pile"
                                            @click="onClick"
                                        />
                                        <div class="deck-reshuffles">Reshuffles: {{ reshuffles }}</div>
                                    </div>
                                    <div class="compost-wrapper">
                                        <div v-if="manaCrystalsCost !== null" class="mana-crystals-cost">
                                            -{{ manaCrystalsCost }} mana crystals
                                        </div>
                                        <div v-if="showCastSpellText" class="cast-spell-text">
                                            Cast Spell
                                        </div>
                                        <CardStack
                                            :cards="compost.cards"
                                            :name="AREAS.Compost"
                                            :highlighted="isCompostHighlighted"
                                            :highlightType="compostHighlightType"
                                            :alwaysShowDummy="true"
                                            customLabel="Compost"
                                            @click="onClick"
                                        />
                                    </div>
                                    <CardStack
                                        :cards="trash.cards"
                                        :name="AREAS.Trash"
                                        :alwaysShowDummy="true"
                                        customLabel="Trash (WIP)"
                                        @click="onClick"
                                    />
                                </div>
                                <div class="mana-pools-area">
                                    <div class="mana-pools">
                                        <CardStack
                                            v-for="([_suit, manaPool], index) in Object.entries(manaPools)"
                                            :key="index"
                                            :cards="(manaPool as ManaPool).cards"
                                            :name="AREAS.ManaPools"
                                            :arrayIndex="index"
                                            :highlighted="highlightedManaPoolIndex === index"
                                            highlightType="burn"
                                            @mousedown.prevent
                                            @click="onClick"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        class="move-to-mana-button"
                                        :disabled="!canMoveToManaPools"
                                        @click="onMoveToManaClick"
                                    >Auto Mana</button>
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
                                    :highlighted="highlightedTableauIndices.includes(index)"
                                    highlightType="cast"
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
                        <button 
                            @click="combat.endTurn" 
                            id="end-turn-button"
                            :disabled="combat.isProcessingTurn"
                            v-if="!combat.isProcessingTurn"
                        >End Turn</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

