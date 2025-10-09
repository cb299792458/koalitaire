import { ref, toRaw, type Ref } from 'vue';
import Card from '../models/Card';
import { AREAS, type Area } from '../models/Areas';
import { openModal } from '../stores/modalStore';

let gameStateInstance: GameState | null = null; // singleton

export const suits: string[] = ["♦️", "♣️", "♥️", "♠️"];
const TABLEAU_SIZE: number = 7;

interface GameState {
    selectedCard: Ref<Card | null>;
    setSelectedCard: (card: Card | null) => void;
    deck: Ref<Card[]>;
    compost: Ref<Card[]>;
    trash: Ref<Card[]>;
    hand: Ref<Card[]>;
    tableau: Ref<Card[][]>;
    manaPools: Ref<Record<string, Card[]>>;
    updateGameState: (card: Card | null, area: Area, arrayIndex?: number, cardIndex?: number) => void;
}

function useGameState() {
    if (gameStateInstance) return gameStateInstance;
    
    const selectedCard: Ref<Card | null> = ref<Card | null>(null);
    function setSelectedCard (card: Card | null): void { gameStateInstance!.selectedCard.value = card };

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
    const manaPools = ref<Record<string, Card[]>>(
        Object.fromEntries(suits.map(suit => [suit, [] as Card[]])) as Record<typeof suits[number], Card[]>
    );

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

    function updateGameState(clickedCard: Card | null, area: Area, arrayIndex?: number, cardIndex?: number): void {
        switch (area) {
            case AREAS.Deck:
                drawCards();
                break;

            case AREAS.Hand:
                isCardSelection(clickedCard);
                break;

            case AREAS.Tableau:
                if (isCardSelection(clickedCard)) break;
                placeSelectedCardInTableau(clickedCard, arrayIndex, cardIndex);
                break;

            case AREAS.ManaPools:
                if (isCardSelection(clickedCard)) break;
                placeSelectedCardInManaPools(clickedCard, arrayIndex);
                break;
                
            case AREAS.Board:
                isCardSelection(clickedCard);
                break;

            case AREAS.Compost:
                openModal('compost', { compost: compost.value });
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

    function placeSelectedCardInTableau(clickedCard: Card | null, arrayIndex?: number, _cardIndex?: number): void {
        if (!selectedCard.value || arrayIndex === undefined || !tableau.value[arrayIndex]) return;

        if (clickedCard?.rank) {
            if (selectedCard.value.suit === clickedCard.suit) return;
            if (selectedCard.value.rank !== clickedCard.rank - 1) return;
        }

        // move selectedCard from hand
        const handIndex = hand.value.indexOf(selectedCard.value);
        if (handIndex !== -1) {
            hand.value.splice(handIndex, 1);
            tableau.value[arrayIndex].push(selectedCard.value);
        } else {
            // move selectedCard from tableau
            const tableauIndex = tableau.value.findIndex(col => col.includes(selectedCard.value!));
            if (!tableau.value[tableauIndex]) return;
            if (tableauIndex !== -1) {
                let movedCardIndex = tableau.value[tableauIndex]!.indexOf(selectedCard.value);
                console.log('moving cards')
                while (movedCardIndex < tableau.value[tableauIndex]!.length) {
                    tableau.value[arrayIndex].push(tableau.value[tableauIndex][movedCardIndex]!);
                    tableau.value[tableauIndex].splice(movedCardIndex, 1);
                }

                if (tableau.value[tableauIndex].length) tableau.value[tableauIndex][tableau.value[tableauIndex].length - 1]!.revealed = true;
            } else {
                throw new Error(`Card not found in hand or tableau: ${selectedCard.value.toString()}`);
            }
        }

        setSelectedCard(null);
    }

    function placeSelectedCardInManaPools(clickedCard: Card | null, arrayIndex?: number): void {
        if (!selectedCard.value || arrayIndex === undefined) return;
        const suit = suits[arrayIndex];
        
        if (!suit || !manaPools.value[suit] || suit !== selectedCard.value.suit) return;
        if (clickedCard?.rank) {
            if (selectedCard.value?.rank !== clickedCard.rank + 1) return;
        } else {
            if (selectedCard.value.rank !== 1) return;
        }

        // move selectedCard from hand
        const handIndex = hand.value.indexOf(selectedCard.value);
        if (handIndex !== -1) {
            hand.value.splice(handIndex, 1);
            manaPools.value[suit].push(selectedCard.value);
        } else {
            // move selectedCard from tableau
            const tableauIndex = tableau.value.findIndex(col => col.includes(selectedCard.value!));
            if (!tableau.value[tableauIndex]) return;
            if (tableauIndex !== -1) {
                const selectedCardIndex = tableau.value[tableauIndex]!.indexOf(selectedCard.value);
                if (selectedCardIndex !== -1) {
                    manaPools.value[suit].push(selectedCard.value);
                    tableau.value[tableauIndex].splice(selectedCardIndex, 1);
                    if (tableau.value[tableauIndex].length) tableau.value[tableauIndex][tableau.value[tableauIndex].length - 1]!.revealed = true;
                } else {
                    throw new Error(`Card not found in tableau: ${selectedCard.value.toString()}`);
                }
            } 
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
        manaPools,
        updateGameState,
    };

    return gameStateInstance;
}

export default useGameState;
