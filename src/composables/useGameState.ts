import { ref, toRaw, type Ref } from 'vue';
import Card from '../models/Card';
import { AREAS, type Area } from '../models/Areas';

let gameStateInstance: GameState | null = null; // singleton

const suits: string[] = ["♦️", "♣️", "♥️", "♠️"];
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
                card.revealed = j === i; // only reveal the last card in the stack
                tableau.value[i]!.push(card);
            }
        }
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
            compost.value.unshift(hand.value.pop()!); 
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

            case AREAS.Board:
                isCardSelection(clickedCard);
                break;

            case AREAS.ManaPools:
            case AREAS.Compost:
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
        if (!selectedCard.value) return;

        if (clickedCard?.rank) {
            if (selectedCard.value?.suit === clickedCard.suit) {
                return;
            }
            if (selectedCard.value?.rank !== clickedCard.rank - 1) {
                return;
            }
        }

        // remove selectedCard from hand
        const handIndex = hand.value.indexOf(selectedCard.value);
        if (handIndex !== -1) {
            hand.value.splice(handIndex, 1);
            tableau.value[arrayIndex!]!.push(selectedCard.value);
        } else {
            const tableauIndex = tableau.value.findIndex(col => col.includes(selectedCard.value!));
            if (tableauIndex !== -1) {
                let movedCardIndex = tableau.value[tableauIndex]!.indexOf(selectedCard.value);
                while (movedCardIndex < tableau.value[tableauIndex]!.length) {
                    tableau.value[arrayIndex!]!.push(tableau.value[tableauIndex]![movedCardIndex]!);
                    tableau.value[tableauIndex]!.splice(movedCardIndex, 1);
                }

                if (tableau.value[tableauIndex]!.length) tableau.value[tableauIndex]![tableau.value[tableauIndex]!.length - 1]!.revealed = true;
            } else {
                throw new Error(`Card not found in hand or tableau: ${selectedCard.value.toString()}`);
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
