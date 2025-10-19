import { ref, toRaw, type Ref } from 'vue';
import Card, { suits } from '../models/Card';
import { AREAS, type Area } from '../models/Areas';
import { openModal } from '../stores/modalStore';
import type Enemy from '../models/Enemy';
import type Player from '../models/Player';

let gameStateInstance: GameState | null = null; // singleton

const TABLEAU_SIZE: number = 7;

interface GameState {
    selectedCard: Ref<Card | null>;
    setSelectedCard: (card: Card | null) => void;
    deck: Ref<Card[]>;
    compost: Ref<Card[]>;
    trash: Ref<Card[]>;
    hand: Ref<Card[]>;
    tableau: Ref<Card[][]>;
    mana: Ref<Record<string, number>>;
    manaPools: Ref<Record<string, Card[]>>;
    updateGameState: (card: Card | null, area: Area, arrayIndex?: number, cardIndex?: number) => void;
    player: Ref<Player | null>;
    enemy: Ref<Enemy | null>;
}

function useGameState() {
    if (gameStateInstance) return gameStateInstance;
    
    const selectedCard: Ref<Card | null> = ref<Card | null>(null);
    function setSelectedCard (card: Card | null): void { gameStateInstance!.selectedCard.value = card };
    const player: Ref<Player | null> = ref(null);
    const enemy: Ref<Enemy | null> = ref(null);

    const deck = ref<Card[]>([]);
    for (let rank = 1; rank <= 13; rank++) {
        for (const suit of suits) {
            deck.value.push(new Card(rank, suit));
        }
    }
    shuffleDeck();

    const compost = ref<Card[]>([]);
    const trash = ref<Card[]>([]);
    const hand = ref<Card[]>([]);
    const mana = ref<Record<string, number>>(Object.fromEntries(suits.map(suit => [suit, 100])) as Record<typeof suits[number], number>);
    const manaPools = ref<Record<string, Card[]>>(Object.fromEntries(suits.map(suit => [suit, [] as Card[]])) as Record<typeof suits[number], Card[]>);

    const tableau = ref<Card[][]>(Array.from({ length: TABLEAU_SIZE }, () => []));
    for (let i = 0; i < TABLEAU_SIZE; i++) {
        for (let j = 0; j <= i; j++) {
            if (deck.value.length > 0) {
                const card = deck.value.pop()!;
                tableau.value[i]!.push(card);
            }
        }
        if (tableau.value[i]!.length > 0) tableau.value[i]![tableau.value[i]!.length - 1]!.revealed = true; // reveal the last card in each tableau column
    }    

    function shuffleDeck(): void {
        for (let i = deck.value.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck.value[i], deck.value[j]] = [deck.value[j]!, deck.value[i]!];
        }
        for (const card of deck.value) {
            card.revealed = false;
        }
    }

    function drawCards(count: number = 3) {
        // move all cards from hand to trash
        while (hand.value.length) {
            compost.value.push(hand.value.pop()!); 
        }

        // If deck is empty, move recycling into the deck
        if (deck.value.length === 0) {
            while (compost.value.length) {
                deck.value.push(compost.value.pop()!);
            }
            shuffleDeck();
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

    function updateGameState(clickedCard: Card | null, clickArea: Area, clickIndex?: number, clickJndex?: number): void {
        switch (clickArea) {
            case AREAS.Deck:
                drawCards();
                // dealRowToTableau();
                break;

            case AREAS.Hand:
                isCardSelection(clickedCard);
                break;

            case AREAS.Tableau:
                if (isCardSelection(clickedCard)) break;
                placeSelectedCardInTableau(clickedCard, clickIndex, clickJndex);
                break;

            case AREAS.ManaPools:
                if (isCardSelection(clickedCard)) break;
                // placeSelectedCardInManaPools(clickedCard, clickIndex);
                break;
                
            case AREAS.Board:
                isCardSelection(clickedCard);
                break;

            case AREAS.Compost:
                openModal('compost', { compost: compost.value });
                break;

            case 'Burn Card':
                burnCard();
                break;
            
            case 'Cast Card':
                castCard();
                break;
                
            case AREAS.Trash:
            default:
                break;
        }
    }
                
    function isCardSelection(clickedCard: Card | null): boolean {
        // Select Card
        if (!selectedCard.value && clickedCard?.rank && clickedCard.revealed) {
            setSelectedCard(clickedCard);
            return true;
        }

        // Deselect Card
        if (!clickedCard || (clickedCard === toRaw(selectedCard.value))) {
            setSelectedCard(null);
            return true;
        }

        return false;
    }

    function placeSelectedCardInTableau(clickedCard: Card | null, clickIndex?: number, clickJndex?: number): void {
        const scv = selectedCard.value;
        if (clickIndex === undefined) return;
        const clickedColumn = tableau.value[clickIndex];
        if (!scv || !clickedColumn || !tableau.value[clickIndex]) return;

        if (clickedCard?.rank) {
            if (scv.suit === clickedCard.suit) return;
            if (scv.rank !== clickedCard.rank - 1) return;
        }

        const handIndex = hand.value.indexOf(scv);
        if (handIndex !== -1) { // move selectedCard from hand
            hand.value.splice(handIndex, 1);
            clickedColumn.push(scv); // untested, may need to use reference to tableau.value[clickIndex]
        } else { // move selectedCard from tableau
            // can't move to top or middle of column
            if (clickJndex !== clickedColumn.length - 1) return;
            
            const selectedCardIndex = tableau.value.findIndex(col => col.includes(scv));
            const selectedCardColumn = tableau.value[selectedCardIndex];
            if (!selectedCardColumn || !tableau.value[selectedCardIndex]) return;
            const selectedCardJndex = tableau.value[selectedCardIndex]!.indexOf(scv);

            // can't move if there are cards below that don't match suit or rank
            for (let i = selectedCardJndex + 1; i < selectedCardColumn.length; i++) {
                const above = selectedCardColumn[i - 1];
                const below = selectedCardColumn[i];
                if (above && below && above.suit === below.suit) return;
                if (above && below && above.rank !== below.rank + 1) return;
            }

            // move card and all below
            while (selectedCardJndex < selectedCardColumn.length) {
                tableau.value[clickIndex].push(selectedCardColumn[selectedCardJndex]!);
                tableau.value[selectedCardIndex].splice(selectedCardJndex, 1);
            }

            // reveal the last card in the column if it exists
            if (selectedCardColumn.length) selectedCardColumn[selectedCardColumn.length - 1]!.revealed = true;
        }

        setSelectedCard(null);
    }

    function burnCard(): void {
        const scv = selectedCard.value;
        if (!scv) return;
        const { rank, suit } = scv;

        const manaColumn = manaPools.value[suit];
        if (!manaColumn) return;
        
        const handIndex = hand.value.indexOf(scv);
        const tableauIndex = tableau.value.findIndex(col => col.includes(scv));
        let tableauJndex = -1;
        if (tableauIndex !== -1) {
            tableauJndex = tableau.value[tableauIndex]!.indexOf(scv);
        }

        if (handIndex === -1 && tableauJndex === -1) return;
        if (tableauIndex !== -1 && tableauJndex !== tableau.value[tableauIndex]!.length - 1) return;

        if (manaColumn.length === 0) {
            if (rank !== 1) return;
        } else {
            const lastCard = manaColumn[manaColumn.length - 1];
            if (rank !== lastCard!.rank + 1) return;
        }

        if (tableauIndex !== -1) {
            tableau.value[tableauIndex]!.splice(tableauJndex, 1);
            if (tableau.value[tableauIndex]!.length) tableau.value[tableauIndex]![tableau.value[tableauIndex]!.length - 1]!.revealed = true;
        } else {
            hand.value.splice(handIndex, 1);
        }

        manaColumn.push(scv);

        mana.value[suit]! += rank;
        setSelectedCard(null);
    }

    function castCard(): void {
        const scv = selectedCard.value;
        if (!scv) return;
        const { rank, suit } = scv;


        if (!mana.value[suit]) return;
        if (mana.value[suit] < rank) return; // not enough mana to cast
        if (!enemy.value || !player.value) return;
        
        const handIndex = hand.value.indexOf(scv);
        const tableauIndex = tableau.value.findIndex(col => col.includes(scv));
        let tableauJndex = -1;
        if (tableauIndex !== -1) {
            tableauJndex = tableau.value[tableauIndex]!.indexOf(scv);
        }
        
        if (handIndex === -1 && tableauJndex === -1) return;
        if (tableauIndex !== -1 && tableauJndex !== tableau.value[tableauIndex]!.length - 1) return;
        
        if (tableauIndex !== -1) {
            tableau.value[tableauIndex]!.splice(tableauJndex, 1);
            if (tableau.value[tableauIndex]!.length) tableau.value[tableauIndex]![tableau.value[tableauIndex]!.length - 1]!.revealed = true;
        } else {
            hand.value.splice(handIndex, 1);
        }

        mana.value[suit] -= rank;
        scv.effect(player.value, enemy.value);

        const manaColumn = manaPools.value[suit];
        if (!manaColumn) return;
        if (manaColumn.length === 0) {
            manaColumn.push(scv);
        } else {
            const lastCard = manaColumn[manaColumn.length - 1];
            if (rank > lastCard!.rank) manaColumn.push(scv);
        }

        setSelectedCard(null);
    }

    gameStateInstance = {
        selectedCard,
        setSelectedCard,
        deck,
        compost,
        trash,
        hand,
        tableau,
        mana,
        manaPools,
        updateGameState,
        player,
        enemy,
    };

    return gameStateInstance;
}

export default useGameState;
