import { ref, toRaw, type Ref } from 'vue';
import Card, { suits } from '../models/Card';
import { AREAS, type Area } from '../models/Areas';
import { openModal } from '../stores/modalStore';
import type Enemy from '../models/Enemy';
import type Player from '../models/Player';

let gameStateInstance: GameState | null = null; // singleton

const TABLEAU_SIZE: number = 5;

export interface GameState {
    selectedCard: Ref<Card | null>;
    setSelectedCard: (card: Card | null) => void;
    deck: Ref<Card[]>;
    compost: Ref<Card[]>;
    trash: Ref<Card[]>;
    hand: Ref<Card[]>;
    tableau: Ref<Card[][]>;
    manaPools: Ref<Record<string, Card[]>>;
    updateGameState: (card: Card | null, area: Area, arrayIndex?: number, cardIndex?: number) => void;
    player: Ref<Player | null>;
    enemy: Ref<Enemy | null>;
    startCombat: () => void;
    endTurn: () => void;
    drawCards: (count?: number, keepHand?: boolean) => void;
}

function useGameState() {
    if (gameStateInstance) return gameStateInstance;
    
    const selectedCard: Ref<Card | null> = ref<Card | null>(null);
    function setSelectedCard (card: Card | null): void { selectedCard.value = card };
    const player: Ref<Player | null> = ref(null);
    const enemy: Ref<Enemy | null> = ref(null);

    const deck = ref<Card[]>([]);

    const compost = ref<Card[]>([]);
    const trash = ref<Card[]>([]);
    const hand = ref<Card[]>([]);
    const manaPools = ref<Record<string, Card[]>>(Object.fromEntries(suits.map(suit => [suit, [] as Card[]])) as Record<typeof suits[number], Card[]>);

    const tableau = ref<Card[][]>(Array.from({ length: TABLEAU_SIZE }, () => []));

    function dealTableau(): void {
        for (let i = 0; i < TABLEAU_SIZE; i++) {
            for (let j = 0; j <= i; j++) {
                if (deck.value.length > 0) {
                    const card = deck.value.pop()!;
                    tableau.value[i]!.push(card);

                }
            }
            if (tableau.value[i]!.length > 0) tableau.value[i]![tableau.value[i]!.length - 1]!.revealed = true; // reveal the last card in each tableau column
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

    function drawCards(count: number = 3, keepHand: boolean = false) {
        // move all cards from hand to trash
        if (!keepHand) {
            while (hand.value.length) {
                compost.value.push(hand.value.pop()!); 
            }
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

    function startCombat(): void {
        deck.value = player.value?.deck || [];  // TODO: Copy deck instead of reference
        shuffleDeck();
        dealTableau();

        startTurn();
    }
    
    function startTurn(): void {
        drawCards(3);

        if (!player.value) return;
        player.value.block = 0;
        
        if (!enemy.value) return;
        enemy.value.loadActions(enemy.value.actions);
    }
    
    function endTurn(): void {
        if (!player.value || !enemy.value) return;
        enemy.value.block = 0;
        enemy.value.executeActions(player.value);

        startTurn();
    }

    function updateGameState(clickedCard: Card | null, clickArea: Area, clickIndex?: number, clickJndex?: number): void {
        switch (clickArea) {
            case AREAS.Deck:
                // drawCards();
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
        if (!canUseSelectedCard()) return;

        scv.animateBurn();
        setTimeout(() => {
            moveCardToArea(scv, AREAS.ManaPools);
        }, scv.animationTime); // move card as animation finishes

        setSelectedCard(null);
    }

    function castCard(): void {
        const scv = selectedCard.value;
        if (!scv) return;
        if (!enemy.value || !player.value) return;

        if (!canUseSelectedCard()) return;
        scv.animate();
        
        setTimeout(() => {
            if (!player.value || !enemy.value) return;
            scv.effect(player.value, enemy.value, gameStateInstance!);
            moveCardToArea(scv, AREAS.Compost); // move card to compost after casting
            for (const card of manaPools.value[scv.suit]!) {
                moveCardToArea(card, AREAS.Compost); // move all cards in mana pool to compost
            }
        }, scv.animationTime); // move card as animation finishes
        
        setSelectedCard(null);
    }

    function canUseSelectedCard(): boolean {
        const scv = selectedCard.value;
        if (!scv || !scv.revealed) return false;
        const { rank, suit } = scv;

        const { handIndex, tableauIndex, tableauJndex } = getCardIndices(selectedCard.value);
        if (handIndex === -1) {
            const tableauColumn = tableau.value[tableauIndex];
            if (tableauJndex !== tableauColumn!.length - 1) return false; // can't use card from hand if it's not the last card in the tableau column
        }

        if (!manaPools.value[suit]) return false;
        if (manaPools.value[suit].length === 0) return rank === 1;
        return manaPools.value[suit][manaPools.value[suit].length - 1]!.rank + 1 === rank;
    }

    function getCardIndices(card: Card | null): { handIndex: number, tableauIndex: number, tableauJndex: number } {
        if (!card) return { handIndex: -1, tableauIndex: -1, tableauJndex: -1 };

        const handIndex = hand.value.indexOf(card);
        const tableauIndex = tableau.value.findIndex(col => col.includes(card));
        let tableauJndex = -1;
        if (tableauIndex !== -1) {
            tableauJndex = tableau.value[tableauIndex]!.indexOf(card);
        }

        return { handIndex, tableauIndex, tableauJndex };
    }

    function moveCardToArea(card: Card, area: Area): void {
        const { handIndex, tableauIndex, tableauJndex } = getCardIndices(card);
        if (handIndex !== -1) {
            hand.value.splice(handIndex, 1);
        } else if (tableauIndex !== -1) {
            tableau.value[tableauIndex]!.splice(tableauJndex, 1);
            if (tableau.value[tableauIndex]!.length) tableau.value[tableauIndex]![tableau.value[tableauIndex]!.length - 1]!.revealed = true;
        } else {
            // card is in mana pools
            const manaPool = manaPools.value[card.suit];
            if (!manaPool) return;
            const manaIndex = manaPool.indexOf(card);
            if (manaIndex !== -1) {
                manaPools.value[card.suit] = [
                    ...manaPool.slice(0, manaIndex),
                    ...manaPool.slice(manaIndex + 1)
                ];
            }
        }

        switch (area) {
            case AREAS.Compost:
                compost.value.push(card);
                break;
            case AREAS.Trash:
                trash.value.push(card);
                break;
            case AREAS.ManaPools:
                manaPools.value[card.suit]!.push(card);
                break;
        }
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
        player,
        enemy,
        startCombat,
        endTurn,
        drawCards,
    };

    return gameStateInstance;
}

export default useGameState;
