<script setup lang="ts">
    import Card from '../models/Card';
    import CardStack from './CardStack.vue';
    import useGameState from '../composables/useGameState';
    import { AREAS } from '../models/Areas';

    const {
        selectedCard,
        deck,
        compost,
        trash,
        hand,
        tableau,
        manaPools,
        drawCards,
        updateGameState,
    } = useGameState();

    function onClick(payload: {
        card: Card | null;
        area: 'deck' | 'compost' | 'trash' | 'hand' | 'tableau' | 'manaPools';
        arrayIndex?: number;
        cardIndex: number;
    }) {
        console.log('Card clicked:', payload);
        const { card, area, arrayIndex, cardIndex } = payload;
        updateGameState(
            card,
            area,
            arrayIndex,
            cardIndex,
        );
    }

    // function moveToMana(manaPool: Card[], suit: string) {
    //     if (!selectedCard.value) return; // no card selected
    //     if (selectedCard.value.suit !== suit) return selectedCard.value = null; // card must match the mana pool suit

    //     if (selectedCard.value.rank !== 1) {
    //         if (manaPool.length === 0) {
    //             selectedCard.value = null;
    //             return selectedCard.value = null; // card must be 1 if mana pool is empty
    //         }
    //         if (manaPool[manaPool.length - 1]!.rank !== selectedCard.value.rank - 1) {
    //             selectedCard.value = null;
    //             return selectedCard.value = null; // card must be one less than the last card in the mana pool
    //         }
    //     }

    //     const handIndex = hand.value.indexOf(selectedCard.value);
    //     const tableauIndex = tableau.findIndex(column =>
    //         column.includes(selectedCard.value!)
    //     );
    //     const columnIndex = tableau[tableauIndex]?.indexOf(selectedCard.value!) || -1;

    //     manaPool.push(selectedCard.value!);
    //     if (handIndex !== -1) {
    //         hand.value.splice(handIndex, 1); // remove card from hand
    //     } else if (tableauIndex !== -1) {
    //         tableau[tableauIndex]!.splice(columnIndex, 1); // remove card from tableau
    //         if (columnIndex > 0) {
    //             tableau[tableauIndex]![columnIndex - 1]!.revealed = true; // reveal the previous card if it exists
    //         }
    //     }

    //     selectedCard.value = null; // deselect the card after moving
    // }

    //     function moveToTableau(tableauColumn: Card[]) {
    // if (!selectedCard.value) return
    // const card = selectedCard.value

    // // Must be revealed
    // if (!card.revealed) {
    //     selectedCard.value = null
    //     return
    // }

    // // Check if the move is valid for non-empty tableau column
    // const lastCard = tableauColumn[tableauColumn.length - 1]
    // if (lastCard) {
    //     // Different color (even/odd suit index)
    //     if (suits.indexOf(lastCard.suit) % 2 === suits.indexOf(card.suit) % 2) {
    //     selectedCard.value = null
    //     return
    //     }

    //     // Number must be one less than last card (tableau descending)
    //     if (lastCard.rank !== card.rank + 1) {
    //     selectedCard.value = null
    //     return
    //     }
    // }

    // // Determine source: hand or another tableau column
    // const handIndex = hand.value.indexOf(card)
    // const tableauIndex = tableau.findIndex(column => column.includes(card))
    // const columnIndex = tableauIndex !== -1 ? tableau[tableauIndex]!.indexOf(card) : -1

    // // Move from hand
    // if (handIndex !== -1) {
    //     tableauColumn.push(card)
    //     hand.value.splice(handIndex, 1)
    // }
    // // Move from another tableau column
    // else if (tableauIndex !== -1 && columnIndex !== -1) {
    //     const sourceColumn = tableau[tableauIndex]!

    //     // Move all cards from sourceColumn starting at columnIndex
    //     const movingCards = sourceColumn.splice(columnIndex)
    //     tableauColumn.push(...movingCards)

    //     // Reveal previous card in sourceColumn if it exists
    //     if (sourceColumn.length > 0) {
    //     sourceColumn[sourceColumn.length - 1]!.revealed = true
    //     }
    // }

    // // Deselect
    // selectedCard.value = null
    // }

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
                            :name="AREAS.Deck"
                            @click="drawCards()"
                        />
                        <CardStack
                            :cards="compost"
                            :name="AREAS.Compost"
                            @mousedown.prevent
                        />
                        <CardStack
                            :cards="trash"
                            :name="AREAS.Trash"
                            @mousedown.prevent
                        />
                    </div>

                    <div class="mana-pools">
                        <CardStack
                            v-for="[suit, cards] in Object.entries(manaPools)"
                            :key="suit"
                            :cards="cards"
                            :name="suit"
                            @mousedown.prevent
                            @click="onClick"
                        />
                    </div>
                </div>

                <div class="cards-bottom">
                    <CardStack
                        v-for="(cards, index) in tableau"
                        :key="index"
                        :cards="cards"
                        :name="AREAS.Tableau"
                        layout="vertical"
                        @mousedown.prevent
                        :selectedCard="selectedCard"
                        :arrayIndex="index"
                        @click="onClick"
                    />
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

