<script setup lang="ts">
    import { reactive, ref, type Reactive, type Ref } from 'vue';
    import type Card from '../Card';
    import CardStack from './CardStack.vue';
    import SingleCard from './SingleCard.vue';

    const suits: string[] = ["♦️", "♣️", "♥️", "♠️"];

    const selectedCard: Ref<Card | null> = ref(null);
    const deck: Ref<Card[]> = ref([]);
    const recycle: Ref<Card[]> = ref([]);
    const trash: Ref<Card[]> = ref([]);
    const hand: Ref<Card[]> = ref([]);
    const manaPools: Reactive<Record<typeof suits[number], Card[]>> = reactive(
        Object.fromEntries(suits.map(suit => [suit, [] as Card[]])) as Record<typeof suits[number], Card[]>
    )
    const tableau: Reactive<Card[][]> = reactive(Array.from({ length: 7 }, () => []));

    function shuffleDeck() {
        // Set all cards to not revealed
        deck.value.forEach(card => (card.revealed = false))

        // Fisher–Yates shuffle
        for (let i = deck.value.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck.value[i], deck.value[j]] = [deck.value[j]!, deck.value[i]!]
        }
    }

    function startGame() {
        for (const suit of suits) {
            for (let number = 1; number <= 13; number++) {
                deck.value.push({ suit, number, revealed: false });
            }
        }

        shuffleDeck();

        for (let i = 0; i < tableau.length; i++) {
            for (let j = 0; j <= i; j++) {
                if (deck.value.length > 0) {
                    const card = deck.value.pop()!;
                    tableau[i]!.push(card);
                }
            }
            if (tableau[i]!.length > 0) {
                tableau[i]![tableau[i]!.length - 1]!.revealed = true; // Reveal the last card in each tableau column
            }
        }
    }

    function drawCards(count: number = 3) {
        while (hand.value.length) {
            recycle.value.push(hand.value.pop()!); // move all cards from hand to trash
        }

        if (deck.value.length === 0) {
            // If deck is empty, move recycling into the deck
            while (recycle.value.length) {
                deck.value.push(recycle.value.pop()!); // move all cards from recycle to deck
            }
            shuffleDeck(); // shuffle the deck again
        }

        for (let i = 0; i < count; i++) {
            if (deck.value.length > 0) {
                const card = deck.value.pop()!;
                card.revealed = true; // reveal the drawn card
                hand.value.push(card);
            } else {
                break; // no more cards to draw
            }
        }
    }

    function moveToMana(manaPool: Card[], suit: string) {
        if (!selectedCard.value) return; // no card selected
        if (selectedCard.value.suit !== suit) return selectedCard.value = null; // card must match the mana pool suit

        if (selectedCard.value.number !== 1) {
            if (manaPool.length === 0) {
                selectedCard.value = null;
                return selectedCard.value = null; // card must be 1 if mana pool is empty
            }
            if (manaPool[manaPool.length - 1]!.number !== selectedCard.value.number - 1) {
                selectedCard.value = null;
                return selectedCard.value = null; // card must be one less than the last card in the mana pool
            }
        }

        const handIndex = hand.value.indexOf(selectedCard.value);
        const tableauIndex = tableau.findIndex(column =>
            column.includes(selectedCard.value!)
        );
        const columnIndex = tableau[tableauIndex]?.indexOf(selectedCard.value!) || -1;

        manaPool.push(selectedCard.value!);
        if (handIndex !== -1) {
            hand.value.splice(handIndex, 1); // remove card from hand
        } else if (tableauIndex !== -1) {
            tableau[tableauIndex]!.splice(columnIndex, 1); // remove card from tableau
            if (columnIndex > 0) {
                tableau[tableauIndex]![columnIndex - 1]!.revealed = true; // reveal the previous card if it exists
            }
        }

        selectedCard.value = null; // deselect the card after moving
    }

    function moveToTableau(tableauColumn: Card[]) {
  if (!selectedCard.value) return
  const card = selectedCard.value

  // Must be revealed
  if (!card.revealed) {
    selectedCard.value = null
    return
  }

  // Check if the move is valid for non-empty tableau column
  const lastCard = tableauColumn[tableauColumn.length - 1]
  if (lastCard) {
    // Different color (even/odd suit index)
    if (suits.indexOf(lastCard.suit) % 2 === suits.indexOf(card.suit) % 2) {
      selectedCard.value = null
      return
    }

    // Number must be one less than last card (tableau descending)
    if (lastCard.number !== card.number + 1) {
      selectedCard.value = null
      return
    }
  }

  // Determine source: hand or another tableau column
  const handIndex = hand.value.indexOf(card)
  const tableauIndex = tableau.findIndex(column => column.includes(card))
  const columnIndex = tableauIndex !== -1 ? tableau[tableauIndex]!.indexOf(card) : -1

  // Move from hand
  if (handIndex !== -1) {
    tableauColumn.push(card)
    hand.value.splice(handIndex, 1)
  }
  // Move from another tableau column
  else if (tableauIndex !== -1 && columnIndex !== -1) {
    const sourceColumn = tableau[tableauIndex]!

    // Move all cards from sourceColumn starting at columnIndex
    const movingCards = sourceColumn.splice(columnIndex)
    tableauColumn.push(...movingCards)

    // Reveal previous card in sourceColumn if it exists
    if (sourceColumn.length > 0) {
      sourceColumn[sourceColumn.length - 1]!.revealed = true
    }
  }

  // Deselect
  selectedCard.value = null
}


    function selectCard(card: Card | null) {
        selectedCard.value = selectedCard.value === card ? null : card;
    }

    startGame();
    drawCards(3);
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
                            @click="drawCards()"
                        />
                        <CardStack
                            :cards="recycle"
                            name="recycle"
                            @mousedown.prevent
                        />
                        <CardStack
                            :cards="trash"
                            name="trash"
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
                            :selectedCard="selectedCard"
                            :moveToMana="moveToMana"
                            @click="moveToMana(cards, suit)"
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
                        :selectedCard="selectedCard"
                        :selectCard="selectCard"
                        @click="moveToTableau(cards)"
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
                <SingleCard
                    v-for="(card, index) in hand"
                    :key="index"
                    :card="card"
                    @mousedown.prevent
                    :selectedCard="selectedCard"
                    :selectCard="selectCard"
                />
            </div>
        </div>
    </div>
</template>

