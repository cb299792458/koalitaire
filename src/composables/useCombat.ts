import { ref, triggerRef, toRaw, type Ref } from 'vue';
import Card, { Suit, Suits } from '../models/Card';
import { AREAS, type Area } from '../models/Areas';
import { openModal } from '../stores/modalStore';
import Enemy from '../models/Enemy';
import Player from '../models/Player';
import ManaPool from '../models/ManaPool';
import EnemyAction from '../models/EnemyAction';
import DrawPile from '../models/DrawPile';
import CompostPile from '../models/CompostPile';
import TrashPile from '../models/TrashPile';

const TABLEAU_SIZE: number = 5;

class Hand {
    cards: Card[];
    constructor() {
        this.cards = []
    }

    addCard(card: Card) {
        this.cards.push(card)
    }

    clear() {
        this.cards = []
    }
}

export class Combat {
    listeners: Set<() => void>;
    player: Player;
    enemy: Enemy;
    
    selectedCard: Card | null;
    deck: DrawPile;
    compost: CompostPile;
    trash: TrashPile;
    hand: Hand;
    tableau: Card[][];
    manaPools: Record<string, ManaPool>;

    constructor(player: Player, enemy: Enemy) {
        this.player = player;
        this.enemy = enemy;
        this.listeners = new Set();
        
        // Initialize game state
        this.selectedCard = null;
        this.deck = new DrawPile();
        this.compost = new CompostPile();
        this.trash = new TrashPile();
        this.hand = new Hand();
        this.tableau = Array.from({ length: TABLEAU_SIZE }, () => []);
        
        // Initialize mana pools with ManaPool instances
        this.manaPools = Object.fromEntries(
            Suits.map(suit => [suit, new ManaPool(suit)])
        )
    }

    /**
     * Start a new combat by copying the given player and enemy
     */
    start(player: Player, enemy: Enemy): void {
        // Create deep copies of player and enemy
        this.player = this.copyPlayer(player);
        this.enemy = this.copyEnemy(enemy);
        
        // Reset game state
        if (!this.player) {
            this.deck.clear();
        } else {
            const deckCards = this.player.deck.map((card) => new Card(
                card.rank,
                card.suit,
                card.name,
                card.description,
                card.effect,
            ));
            this.deck.initialize(deckCards);
        }

        this.compost.clear();
        this.trash.clear();
        this.hand.clear();

        this.tableau = Array.from({ length: TABLEAU_SIZE }, () => []);

        this.shuffleDeck();
        this.dealTableau();
        this.startTurn();
        
        this.notify();
    }

    /**
     * Create a deep copy of a player
     */
    private copyPlayer(player: Player): Player {
        const playerCopy = new Player({
            name: player.name,
            portrait: player.portrait,
            appeal: player.appeal,
            attack: player.attack,
            armor: player.armor,
            agility: player.agility,
            arcane: player.arcane,
            health: player.maxHealth,
            gold: player.gold,
            makeDeck: () => player.deck.map(card => new Card(
                card.rank,
                card.suit,
                card.name,
                card.description,
                card.effect
            ))
        });
        playerCopy.level = player.level;
        playerCopy.health = player.health; // Copy current health
        playerCopy.manaCrystals = player.manaCrystals;
        playerCopy.block = player.block;
        return playerCopy;
    }

    /**
     * Create a deep copy of an enemy
     */
    private copyEnemy(enemy: Enemy): Enemy {
        const enemyCopy = new Enemy(
            enemy.name,
            enemy.portrait,
            enemy.maxHealth,
            () => enemy.deck.map(action => new EnemyAction(
                action.name,
                action.description,
                action.effect
            ))
        );
        enemyCopy.actions = enemy.actions;
        enemyCopy.health = enemy.health; // Copy current health
        enemyCopy.block = enemy.block;
        enemyCopy.attack = enemy.attack;
        enemyCopy.armor = enemy.armor;
        return enemyCopy;
    }

    subscribe(fn: () => void) {
        this.listeners.add(fn);
    }

    notify() {
        for (const fn of this.listeners) fn();
    }

    setSelectedCard(card: Card | null): void {
        this.selectedCard = card;
    }

    drawCards(count: number = 3, keepHand: boolean = false): void {
        // move all cards from hand to compost
        if (!keepHand) {
            this.compost.addCards([...this.hand.cards]);
            this.hand.clear();
        }

        // If deck is empty, recycle compost into the deck
        if (this.deck.isEmpty()) {
            this.compost.recycleInto(this.deck);
            this.deck.shuffle();
        }

        // Draw cards and reveal them
        const drawnCards = this.deck.drawMultiple(count);
        for (const card of drawnCards) {
            card.revealed = true;
            this.hand.addCard(card);
        }
        this.notify();
    }

    shuffleDeck(): void {
        this.deck.shuffle();
    }

    dealTableau(): void {
        for (let i = 0; i < TABLEAU_SIZE; i++) {
            console.log('dealing')
            const column: Card[] = [];
            this.tableau[i] = column;
            
            for (let j = 0; j <= i; j++) {
                const card = this.deck.draw();
                if (card) {
                    column.push(card);
                }
            }
            // reveal the last card in each tableau column
            if (column.length > 0) {
                const lastCard = column[column.length - 1];
                if (lastCard) lastCard.revealed = true;
            }
        }
        this.notify();
    }

    startTurn(): void {
        this.drawCards(3);

        if (!this.player) return;
        this.player.block = 0;
        
        if (!this.enemy) return;
        this.enemy.loadActions(this.enemy.actions);
        
        this.notify();
    }

    endTurn(): void {
        if (!this.player || !this.enemy) return;
        this.enemy.block = 0;
        this.enemy.executeActions(this.player);

        this.startTurn();
    }

    updateGameState(clickedCard: Card | null, clickArea: Area, clickIndex?: number, clickJndex?: number): void {
        switch (clickArea) {
            case AREAS.Deck:
                break;

            case AREAS.Hand:
                this.isCardSelection(clickedCard);
                break;

            case AREAS.Tableau:
                // If clicking empty tableau column and have selected card, allow placement
                // Otherwise, handle selection/deselection normally
                const isEmptyTableauClick = (!clickedCard || !clickedCard.rank) && clickJndex === -1;
                if (!isEmptyTableauClick && this.isCardSelection(clickedCard)) break;
                this.placeSelectedCardInTableau(clickedCard, clickIndex, clickJndex);
                break;

            case AREAS.ManaPools:
                if (this.isCardSelection(clickedCard)) break;
                break;
                
            case AREAS.Board:
                this.isCardSelection(clickedCard);
                break;

            case AREAS.Compost:
                openModal('compost', { compost: this.compost.cards });
                break;

            case 'Burn Card':
                this.burnCard();
                break;
            
            case 'Cast Card':
                this.castCard();
                break;
                
            case AREAS.Trash:
            default:
                break;
        }
    }

    private isCardSelection(clickedCard: Card | null): boolean {
        // Select Card
        if (!this.selectedCard && clickedCard?.revealed) {
            this.setSelectedCard(clickedCard);
            return true;
        }

        // Deselect Card - empty area or dummy card (rank 0)
        if (!clickedCard || !clickedCard.rank) {
            this.setSelectedCard(null);
            return true;
        }
        
        // Deselect if clicking the same card - compare by reference first
        const selected = toRaw(this.selectedCard);
        if (selected && clickedCard === selected) {
            this.setSelectedCard(null);
            return true;
        }
        
        // Also check if it's the same card by checking if it's at the same position
        if (selected) {
            const clickedIndices = this.getCardIndices(clickedCard);
            const selectedIndices = this.getCardIndices(selected);
            
            if (clickedIndices.handIndex === selectedIndices.handIndex && 
                clickedIndices.handIndex !== -1) {
                this.setSelectedCard(null);
                return true;
            }
            
            if (clickedIndices.tableauIndex === selectedIndices.tableauIndex && 
                clickedIndices.tableauJndex === selectedIndices.tableauJndex &&
                clickedIndices.tableauIndex !== -1) {
                this.setSelectedCard(null);
                return true;
            }
        }

        return false;
    }

    private placeSelectedCardInTableau(clickedCard: Card | null, clickIndex?: number, clickJndex?: number): void {
        const scv = this.selectedCard;
        if (clickIndex === undefined) return;
        const clickedColumn = this.tableau[clickIndex];
        if (!scv || !clickedColumn || !this.tableau[clickIndex]) return;

        // If clicking on a real card (not empty column), validate the move
        if (clickedCard?.rank) {
            if (scv.suit === clickedCard.suit) return;
            if (scv.rank !== clickedCard.rank - 1) return;
        }
        // If clicking on empty column, allow placement (no validation needed for empty columns)

        const handIndex = this.hand.cards.indexOf(scv);
        if (handIndex !== -1) { // move selectedCard from hand
            this.hand.cards.splice(handIndex, 1);
            clickedColumn.push(scv);
        } else { // move selectedCard from tableau
            // can't move to top or middle of column (unless column is empty)
            const isEmptyColumn = clickedColumn.length === 0;
            if (!isEmptyColumn && clickJndex !== clickedColumn.length - 1) return;
            
            const selectedCardIndex = this.tableau.findIndex(col => col.includes(scv));
            const selectedCardColumn = this.tableau[selectedCardIndex];
            if (!selectedCardColumn || !this.tableau[selectedCardIndex]) return;
            const selectedCardJndex = this.tableau[selectedCardIndex]!.indexOf(scv);

            // can't move if there are cards below that don't match suit or rank
            for (let i = selectedCardJndex + 1; i < selectedCardColumn.length; i++) {
                const above = selectedCardColumn[i - 1];
                const below = selectedCardColumn[i];
                if (above && below && above.suit === below.suit) return;
                if (above && below && above.rank !== below.rank + 1) return;
            }

            // move card and all below - calculate cards to move first to avoid mutation during iteration
            const cardsToMove = selectedCardColumn.slice(selectedCardJndex);
            this.tableau[clickIndex].push(...cardsToMove);
            this.tableau[selectedCardIndex].splice(selectedCardJndex, cardsToMove.length);

            // reveal the last card in the column if it exists
            if (selectedCardColumn.length) selectedCardColumn[selectedCardColumn.length - 1]!.revealed = true;
        }

        this.setSelectedCard(null);
        this.notify();
    }

    private burnCard(): void {
        const scv = this.selectedCard;
        if (!scv) return;
        if (!this.canUseSelectedCard()) return;

        scv.animateBurn();
        setTimeout(() => {
            this.moveCardToArea(scv, AREAS.ManaPools);
        }, scv.animationTime); // move card as animation finishes

        this.setSelectedCard(null);
    }

    private castCard(): void {
        const scv = this.selectedCard;
        if (!scv) return;
        if (!this.enemy || !this.player) return;

        if (!this.canUseSelectedCard()) return;
        scv.animate();
        
        setTimeout(() => {
            if (!this.player || !this.enemy) return;
            // Note: Card effect signature expects GameState but effects don't actually use it
            // They only use player and enemy. We pass this for compatibility.
            scv.effect(this.player, this.enemy, this as any);
            this.moveCardToArea(scv, AREAS.Compost); // move card to compost after casting
            // move all cards in mana pool to compost
            const manaPool = this.manaPools[scv.suit];
            if (manaPool) {
                // Create a copy of the array to avoid mutation during iteration
                const cardsToCompost = [...manaPool.cards];
                for (const card of cardsToCompost) {
                    this.moveCardToArea(card, AREAS.Compost);
                }
            }
        }, scv.animationTime); // move card as animation finishes
        
        this.setSelectedCard(null);
    }

    private canUseSelectedCard(): boolean {
        const scv = this.selectedCard;
        if (!scv || !scv.revealed) return false;
        const { rank, suit } = scv;

        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(this.selectedCard);
        if (handIndex === -1) {
            const tableauColumn = this.tableau[tableauIndex];
            if (!tableauColumn || tableauJndex !== tableauColumn.length - 1) return false; // can't use card if it's not the last card in the tableau column
        }

        const manaPool = this.manaPools[suit];
        if (!manaPool) return false;
        return manaPool.hasEnoughMana(rank);
    }

    private getCardIndices(card: Card | null): { handIndex: number, tableauIndex: number, tableauJndex: number } {
        if (!card) return { handIndex: -1, tableauIndex: -1, tableauJndex: -1 };

        const handIndex = this.hand.cards.indexOf(card);
        const tableauIndex = this.tableau.findIndex(col => col.includes(card));
        let tableauJndex = -1;
        if (tableauIndex !== -1) {
            tableauJndex = this.tableau[tableauIndex]!.indexOf(card);
        }

        return { handIndex, tableauIndex, tableauJndex };
    }

    private moveCardToArea(card: Card, area: Area): void {
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(card);
        if (handIndex !== -1) {
            this.hand.cards.splice(handIndex, 1);
        } else if (tableauIndex !== -1) {
            const tableauColumn = this.tableau[tableauIndex];
            if (tableauColumn && tableauJndex !== -1) {
                tableauColumn.splice(tableauJndex, 1);
                // reveal the last card in the column if it exists
                if (tableauColumn.length > 0) {
                    const lastCard = tableauColumn[tableauColumn.length - 1];
                    if (lastCard) lastCard.revealed = true;
                }
            }
        } else {
            // card is in mana pools
            const manaPool = this.manaPools[card.suit];
            if (manaPool) {
                manaPool.removeCard(card);
            }
        }

        switch (area) {
            case AREAS.Compost:
                this.compost.addCard(card);
                break;
            case AREAS.Trash:
                this.trash.addCard(card);
                break;
            case AREAS.ManaPools:
                const targetManaPool = this.manaPools[card.suit];
                if (targetManaPool) {
                    targetManaPool.addCard(card);
                }
                break;
        }
        this.notify();
    }
}

// useCombat composable
const combatRef = ref<Combat | null>(null);

export function useCombat() {
    if (!combatRef.value) {
        // Create a default combat instance - will be initialized by start()
        const defaultPlayer = new Player({
            name: '',
            portrait: '',
            appeal: 0,
            attack: 0,
            armor: 0,
            agility: 0,
            arcane: 0,
            health: 0,
            gold: 0,
            makeDeck: () => []
        });
        const defaultEnemy = new Enemy('', '', 0, () => []);
        
        const combat = new Combat(defaultPlayer, defaultEnemy);

        // whenever combat logic changes, notify Vue
        combat.subscribe(() => {
            triggerRef(combatRef);
        });

        combatRef.value = combat;
    }

    return combatRef.value;
}
