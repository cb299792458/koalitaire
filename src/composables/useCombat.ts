import { ref, triggerRef, toRaw } from 'vue';

// Models
import Card, { Suits, SpellCard } from '../models/Card';
import Player from '../models/Player';
import Enemy from '../models/Enemy';
import DrawPile from '../models/DrawPile';
import CompostPile from '../models/CompostPile';
import TrashPile from '../models/TrashPile';
import Hand from '../models/Hand';
import Tableau from '../models/Tableau';
import ManaPool from '../models/ManaPool';

// Types & Constants
import { AREAS, type Area } from '../models/Areas';
import { openModal, closeModal } from '../stores/modalStore';

const TABLEAU_SIZE = 7;

export class Combat {
    // Game entities
    player: Player;
    enemy: Enemy;
    
    // Game state
    selectedCard: Card | null;
    deck: DrawPile;
    compost: CompostPile;
    trash: TrashPile;
    hand: Hand;
    tableau: Tableau;
    manaPools: Record<string, ManaPool>;
    isProcessingTurn: boolean;
    reshuffles: number;
    
    // Observer pattern
    listeners: Set<() => void>;
    
    // Callback for when enemy is defeated
    onEnemyDefeated?: () => void;
    onEnemyDefeatedContinue?: () => void;

    constructor(player: Player, enemy: Enemy) {
        this.player = player;
        this.enemy = enemy;
        this.listeners = new Set();
        
        this.selectedCard = null;
        this.deck = new DrawPile();
        this.compost = new CompostPile();
        this.trash = new TrashPile();
        this.hand = new Hand();
        this.tableau = new Tableau(TABLEAU_SIZE);
        this.isProcessingTurn = false;
        this.reshuffles = 2;
        
        this.manaPools = Object.fromEntries(
            Suits.map(suit => [suit, new ManaPool(suit)])
        );
    }

    // ==================== Lifecycle Methods ====================

    /**
     * Start a new combat by copying the given player and enemy
     */
    start(player: Player, enemy: Enemy): void {
        this.player = player.copy();
        this.enemy = enemy.copy();
        
        // Reset game state
        if (!this.player) {
            this.deck.clear();
        } else {
            const deckCards = this.player.deck.map((card) => {
                // Preserve SpellCard instances
                if (card.isSpell) {
                    const spellCard = card as SpellCard;
                    return new SpellCard(
                        spellCard.rank,
                        spellCard.suit,
                        spellCard.name,
                        spellCard.description,
                        spellCard.effect
                    );
                } else {
                    return new Card(card.rank, card.suit);
                }
            });
            this.deck.initialize(deckCards);
        }

        this.compost.clear();
        this.trash.clear();
        Object.values(this.manaPools).forEach(pool => pool.clear());
        this.hand.clear();
        this.reshuffles = 2;

        this.initializeTableau();
        this.shuffleDeck();
        this.dealTableau();
        
        // Reset player state
        if (this.player) {
            this.player.block = 0;
            this.player.manaCrystals = 0;
        }
        
        this.startTurn();
        
        this.notify();
    }

    // ==================== Turn Management ====================

    startTurn(): void {
        this.drawCards(5);

        if (!this.player) return;
        this.player.block = 0;
        
        if (!this.enemy) return;
        this.enemy.loadActions(this.enemy.actions);
        
        this.notify();
    }

    async endTurn(): Promise<void> {
        if (!this.player || !this.enemy) return;
        if (this.isProcessingTurn) return; // Prevent multiple simultaneous end turns
        
        this.isProcessingTurn = true;
        this.notify();

        // If deck is empty and no reshuffles left, show confirmation before proceeding
        if (this.deck.isEmpty() && this.reshuffles === 0) {
            openModal('confirmNoReshuffles', {
                message: 'Are you sure? You have no reshuffles left, this will empty your mana pool and redeal the entire deck.',
                onConfirm: () => {
                    closeModal();
                    this.executeRedealAndFinishTurn();
                },
            });
            this.isProcessingTurn = false;
            this.notify();
            return;
        }
        
        try {
            // Player summons run at the end of the player turn
            for (const summon of this.player.summons) {
                summon.effect(this);
                this.notify();
                await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s pause after each summon
            }
            
            // Check if enemy is dead after player summons
            if (this.enemy.health <= 0) {
                this.defeatEnemy();
                return;
            }
            
            this.enemy.block = 0;
            await this.enemy.executeActions(this.player, this);
            
            // Check if enemy is dead after enemy actions
            if (this.enemy.health <= 0) {
                this.defeatEnemy();
                return;
            }

            // If deck is empty when ending turn, use a reshuffle: recycle compost into deck and decrement
            if (this.deck.isEmpty() && this.reshuffles > 0) {
                this.compost.recycleInto(this.deck);
                this.deck.shuffle();
                this.reshuffles -= 1;
            }

            this.startTurn();
        } finally {
            this.isProcessingTurn = false;
            this.notify();
        }
    }
    
    checkEnemyDeath(): boolean {
        if (!this.enemy || !this.player) return false;
        
        if (this.enemy.health <= 0) {
            this.defeatEnemy();
            return true;
        }
        return false;
    }
    
    private defeatEnemy(): void {
        if (!this.player) return;
        
        // Advance player level
        this.player.level += 1;
        
        // Open enemy defeated modal with continue callback
        openModal('enemyDefeated', { 
            onContinue: () => {
                if (this.onEnemyDefeatedContinue) {
                    this.onEnemyDefeatedContinue();
                }
            }
        }, true);
        
        // Notify that enemy was defeated
        if (this.onEnemyDefeated) {
            this.onEnemyDefeated();
        }
    }

    /**
     * Called when player confirms "no reshuffles" popup: gather all cards into deck,
     * shuffle, reset tableau and redeal, set reshuffles to 2, then run the rest of end turn.
     */
    async executeRedealAndFinishTurn(): Promise<void> {
        if (!this.player || !this.enemy) return;
        this.isProcessingTurn = true;
        this.notify();
        try {
            // Move hand to compost
            this.compost.addCards([...this.hand.cards]);
            this.hand.clear();
            // Move tableau to compost
            for (const column of this.tableau.getColumns()) {
                this.compost.addCards([...column.cards]);
                column.cards = [];
            }
            // Move mana pools to compost
            for (const pool of Object.values(this.manaPools)) {
                this.compost.addCards([...pool.cards]);
                pool.clear();
            }
            // Recycle compost into deck, shuffle, reset tableau and redeal
            this.compost.recycleInto(this.deck);
            this.deck.shuffle();
            this.tableau.clear();
            this.dealTableau();
            this.reshuffles = 2;
            this.notify();

            // Run the rest of end turn: summons, enemy actions, then start new turn
            for (const summon of this.player.summons) {
                summon.effect(this);
                this.notify();
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            if (this.enemy.health <= 0) {
                this.defeatEnemy();
                return;
            }
            this.enemy.block = 0;
            await this.enemy.executeActions(this.player, this);
            if (this.enemy.health <= 0) {
                this.defeatEnemy();
                return;
            }
            this.startTurn();
        } finally {
            this.isProcessingTurn = false;
            this.notify();
        }
    }

    // ==================== Card Drawing & Deck Management ====================

    drawCards(count: number = 5, keepHand: boolean = false): void {
        // Move all cards from hand to compost
        if (!keepHand) {
            this.compost.addCards([...this.hand.cards]);
            this.hand.clear();
        }

        // Draw cards and reveal them
        const drawnCards = this.deck.drawMultiple(count);
        for (let i = 0; i < drawnCards.length; i++) {
            const card = drawnCards[i];
            if (!card) continue;
            // Stagger animations slightly for visual effect
            setTimeout(() => {
                card.revealed = true;
                this.hand.addCard(card);
                this.notify();
                // Animate after card is added to DOM
                setTimeout(() => {
                    card.animateDraw();
                }, 10);
            }, i * 100); // 100ms delay between each card
        }
    }

    shuffleDeck(): void {
        this.deck.shuffle();
    }

    // ==================== Tableau Management ====================

    initializeTableau(): void {
        this.tableau = new Tableau(TABLEAU_SIZE);
    }

    dealTableau(): void {
        this.tableau.deal(this.deck);
        this.notify();
    }

    // ==================== Card Selection ====================

    setSelectedCard(card: Card | null): void {
        this.selectedCard = card;
    }

    private isCardSelection(clickedCard: Card | null): boolean {
        // Select card if none selected
        if (!this.selectedCard && clickedCard?.revealed) {
            this.setSelectedCard(clickedCard);
            return true;
        }

        // Deselect card - empty area or dummy card (rank 0)
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
        
        // Check if it's the same card by checking position
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

        // If a card is already selected and clicking a different revealed card, select the new one
        if (this.selectedCard && clickedCard?.revealed && clickedCard !== selected) {
            this.setSelectedCard(clickedCard);
            return true;
        }

        return false;
    }

    // ==================== Card Actions ====================

    updateGameState(clickedCard: Card | null, clickArea: Area, clickIndex?: number, clickJndex?: number): void {
        switch (clickArea) {
            case AREAS.Deck:
                break;

            case AREAS.Hand:
                this.isCardSelection(clickedCard);
                break;

            case AREAS.Tableau:
                // Try to place the selected card first
                if (this.selectedCard && clickIndex !== undefined) {
                    const clickedColumn = this.tableau.getColumn(clickIndex);
                    if (clickedColumn) {
                        // Check if placement is valid
                        const isEmptyColumn = clickedColumn.size() === 0;
                        const canPlace = isEmptyColumn || 
                            (clickedCard?.rank && 
                             this.selectedCard.suit !== clickedCard.suit && 
                             this.selectedCard.rank === clickedCard.rank - 1);
                        
                        if (canPlace) {
                            this.placeSelectedCardInTableau(clickedCard, clickIndex, clickJndex);
                            break;
                        }
                    }
                }
                // If placement not valid or no selected card, handle selection/deselection
                this.isCardSelection(clickedCard);
                break;

            case AREAS.ManaPools: {
                if (this.selectedCard) {
                    const clickedPoolSuit = clickIndex !== undefined ? Suits[clickIndex] : undefined;
                    const canBurn = this.canBurnSelectedCard()
                        && clickedPoolSuit !== undefined
                        && this.selectedCard.suit === clickedPoolSuit;
                    if (canBurn) {
                        this.burnCard();
                        break;
                    }
                }
                // Allow selecting the top card of a mana pool (so it can be moved to tableau)
                if (clickedCard && this.isTopCardOfManaPool(clickedCard)) {
                    const selected = toRaw(this.selectedCard);
                    if (!selected) {
                        this.setSelectedCard(clickedCard);
                    } else if (selected === clickedCard) {
                        this.setSelectedCard(null);
                    } else {
                        this.setSelectedCard(clickedCard);
                    }
                    this.notify();
                    break;
                }
                // Clicked empty area or a non-top card: treat as selection (e.g. deselect)
                if (this.isCardSelection(clickedCard)) break;
                break;
            }
                
            case AREAS.Board:
                this.isCardSelection(clickedCard);
                break;

            case AREAS.Compost:
                if (this.selectedCard && this.canCastSelectedCard()) {
                    this.castCard();
                } else {
                    openModal('compost', { compost: this.compost.cards });
                }
                break;

            case AREAS.Trash:
                openModal('trash', { trash: this.trash.cards });
                break;

            default:
                break;
        }
    }

    private burnCard(): void {
        if (!this.selectedCard || !this.canBurnSelectedCard()) return;

        const selectedCard = this.selectedCard;
        selectedCard.animateBurn();
        setTimeout(() => {
            this.moveCardToArea(selectedCard, AREAS.ManaPools);
        }, 1200); // Match burn animation time (1.2s)

        this.setSelectedCard(null);
    }

    private castCard(): void {
        if (!this.selectedCard || !this.player || !this.enemy) return;
        if (!this.canCastSelectedCard()) return;

        const selectedCard = this.selectedCard;
        selectedCard.animate();
        
        setTimeout(() => {
            if (!this.player || !this.enemy) return;
            
            // Calculate and remove manaCrystals needed
            const manaPool = this.manaPools[selectedCard.suit];
            if (manaPool) {
                const manaCrystalsNeeded = selectedCard.rank - manaPool.cards.length;
                if (manaCrystalsNeeded > 0) {
                    this.player.manaCrystals -= manaCrystalsNeeded;
                    if (this.player.manaCrystals < 0) {
                        this.player.manaCrystals = 0;
                    }
                }
                
                // Move only the top X cards from mana pool to compost, where X is the spell's rank
                const cardsToDiscard = manaPool.cards.slice(-selectedCard.rank);
                for (const card of cardsToDiscard) {
                    this.moveCardToArea(card, AREAS.Compost);
                }
            }
        
        // Trigger spell card effect if it's a spell card
        if (selectedCard.isSpell) {
            const spellCard = selectedCard as SpellCard;
            spellCard.effect(this);
        }
        
        // Move the card to compost
        this.moveCardToArea(selectedCard, AREAS.Compost);
        
        // Check if enemy died from card effect
        if (this.checkEnemyDeath()) {
            return;
        }
            
            this.notify();
        }, selectedCard.animationTime);
        
        this.setSelectedCard(null);
    }

    private canCastSelectedCard(): boolean {
        if (!this.selectedCard || !this.selectedCard.revealed || !this.player) return false;
        
        // Only spell cards can be cast
        if (!this.selectedCard.isSpell) return false;
        
        const { rank, suit } = this.selectedCard;
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(this.selectedCard);
        
        // Must be from hand or last in tableau
        if (handIndex === -1) {
            const tableauColumn = this.tableau.getColumn(tableauIndex);
            if (!tableauColumn || tableauJndex !== tableauColumn.size() - 1) return false;
        }

        // Check if player has enough manaCrystals
        const manaPool = this.manaPools[suit];
        if (!manaPool) return false;
        
        const manaCrystalsNeeded = rank - manaPool.cards.length;
        return manaCrystalsNeeded <= this.player.manaCrystals;
    }

    /**
     * Get the number of mana crystals needed to cast the selected card
     * Returns -1 if the card cannot be cast or calculation is not applicable
     */
    getManaCrystalsNeededForCast(): number {
        if (!this.selectedCard || !this.selectedCard.revealed || !this.player) return -1;
        
        const { rank, suit } = this.selectedCard;
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(this.selectedCard);
        
        // Must be from hand or last in tableau
        if (handIndex === -1) {
            const tableauColumn = this.tableau.getColumn(tableauIndex);
            if (!tableauColumn || tableauJndex !== tableauColumn.size() - 1) return -1;
        }

        const manaPool = this.manaPools[suit];
        if (!manaPool) return -1;
        
        const manaCrystalsNeeded = rank - manaPool.cards.length;
        return manaCrystalsNeeded > 0 ? manaCrystalsNeeded : 0;
    }

    /**
     * Check if the selected card can be burned (moved to mana pool)
     * A card can be burned if it's from the hand or the last card in a tableau column,
     * and the mana pool has enough cards matching the card's rank
     * Spell cards cannot be burned
     */
    canBurnSelectedCard(): boolean {
        if (!this.selectedCard || !this.selectedCard.revealed) return false;
        
        // Spell cards cannot be burned
        if (this.selectedCard.isSpell) {
            return false;
        }
        
        const { rank, suit } = this.selectedCard;
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(this.selectedCard);
        
        // Must be from hand or last in tableau
        if (handIndex === -1) {
            const tableauColumn = this.tableau.getColumn(tableauIndex);
            if (!tableauColumn || tableauJndex !== tableauColumn.size() - 1) return false;
        }

        // Check if mana pool has enough cards for burning
        const manaPool = this.manaPools[suit];
        if (!manaPool) return false;
        return manaPool.hasEnoughManaForBurn(rank);
    }

    /**
     * Check if a card can be burned (moved to its matching mana pool).
     * Same rules as canBurnSelectedCard but for an arbitrary card.
     */
    private canBurnCard(card: Card): boolean {
        if (!card.revealed) return false;
        if (card.isSpell) return false;

        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(card);
        if (handIndex === -1) {
            const tableauColumn = this.tableau.getColumn(tableauIndex);
            if (!tableauColumn || tableauJndex !== tableauColumn.size() - 1) return false;
        }

        const manaPool = this.manaPools[card.suit];
        if (!manaPool) return false;
        return manaPool.hasEnoughManaForBurn(card.rank);
    }

    /**
     * Returns all cards that can be moved to any pile in manaPools.
     * Checks the bottom card in each tableau column and each card in the player's hand.
     */
    getCardsMovableToManaPools(): Card[] {
        const candidates: Card[] = [];

        for (const column of this.tableau.getColumns()) {
            if (column.cards.length > 0) {
                const bottomCard = column.cards[column.cards.length - 1];
                if (bottomCard) candidates.push(bottomCard);
            }
        }

        candidates.push(...this.hand.cards);

        return candidates.filter(card => this.canBurnCard(card));
    }

    /**
     * Repeatedly moves cards from tableau bottoms and hand to their matching mana pools
     * until no more cards can be moved.
     */
    moveAllPossibleToManaPools(): void {
        while (true) {
            const movable = this.getCardsMovableToManaPools();
            if (movable.length === 0) break;
            this.moveCardToArea(movable[0]!, AREAS.ManaPools);
        }
    }

    /**
     * Check if the selected card is playable (can be cast)
     * Uses canCastSelectedCard to determine if the card can be cast
     */
    isSelectedCardPlayable(): boolean {
        return this.canCastSelectedCard();
    }

    /**
     * Check if the selected card can be placed in tableau columns
     * Returns an array of column indices where the card can be placed
     */
    canPlaceSelectedCardInTableau(): number[] {
        if (!this.selectedCard || !this.selectedCard.revealed) return [];
        
        const selectedCard = this.selectedCard;
        const columns = this.tableau.getColumns();
        const validColumns: number[] = [];
        
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            if (!column) continue;
            
            // Empty column - any card can be placed
            if (column.size() === 0) {
                validColumns.push(i);
                continue;
            }
            
            // Check if can be placed on top of the last card
            const lastCard = column.cards[column.size() - 1];
            if (!lastCard) continue;
            
            // Must be different suit and rank must be one less
            if (selectedCard.suit !== lastCard.suit && selectedCard.rank === lastCard.rank - 1) {
                validColumns.push(i);
            }
        }
        
        return validColumns;
    }

    // ==================== Tableau Placement ====================

    private placeSelectedCardInTableau(clickedCard: Card | null, clickIndex?: number, clickJndex?: number): void {
        const selectedCard = this.selectedCard;
        if (clickIndex === undefined || !selectedCard) return;
        
        const clickedColumn = this.tableau.getColumn(clickIndex);
        if (!clickedColumn) return;

        // Validate move if clicking on a real card
        if (clickedCard?.rank) {
            if (selectedCard.suit === clickedCard.suit) return;
            if (selectedCard.rank !== clickedCard.rank - 1) return;
        }

        // Move card from hand, mana pool, or tableau
        const handIndex = this.hand.cards.indexOf(selectedCard);
        if (handIndex !== -1) {
            // Move from hand
            selectedCard.animateTableauMove();
            setTimeout(() => {
                this.hand.cards.splice(handIndex, 1);
                clickedColumn.add(selectedCard);
                this.setSelectedCard(null);
                this.notify();
            }, 450); // Match animation time (400ms + 50ms delay)
            return;
        }
        if (this.isTopCardOfManaPool(selectedCard)) {
            // Move top card from mana pool to tableau
            const pool = this.manaPools[selectedCard.suit];
            if (!pool) return;
            selectedCard.animateTableauMove();
            setTimeout(() => {
                pool.removeCard(selectedCard);
                clickedColumn.add(selectedCard);
                this.setSelectedCard(null);
                this.notify();
            }, 450);
            return;
        }
        {
            // Move from tableau
            const isEmptyColumn = clickedColumn.size() === 0;
            if (!isEmptyColumn && clickJndex !== clickedColumn.size() - 1) return;
            
            const selectedCardIndex = this.tableau.getColumns().findIndex(col => col.cards.includes(selectedCard));
            const selectedCardColumn = this.tableau.getColumn(selectedCardIndex);
            if (!selectedCardColumn) return;
            const selectedCardJndex = selectedCardColumn.cards.indexOf(selectedCard);

            // Validate that cards below match suit and rank
            for (let i = selectedCardJndex + 1; i < selectedCardColumn.cards.length; i++) {
                const above = selectedCardColumn.cards[i - 1];
                const below = selectedCardColumn.cards[i];
                if (above && below && above.suit === below.suit) return;
                if (above && below && above.rank !== below.rank + 1) return;
            }

            // Move card and all below it
            selectedCard.animateTableauMove();
            setTimeout(() => {
                const cardsToMove = selectedCardColumn.cards.slice(selectedCardJndex);
                clickedColumn.cards.push(...cardsToMove);
                selectedCardColumn.cards.splice(selectedCardJndex, cardsToMove.length);

                // Reveal the last card in the column if it exists
                if (selectedCardColumn.cards.length > 0) {
                    const lastCard = selectedCardColumn.cards[selectedCardColumn.cards.length - 1];
                    if (lastCard) lastCard.revealed = true;
                }
                this.setSelectedCard(null);
                this.notify();
            }, 450); // Match animation time (400ms + 50ms delay)
            return; // Early return since we're handling notify in setTimeout
        }
    }

    // ==================== Card Movement ====================

    /** True if the card is the top (last) card in its mana pool. */
    private isTopCardOfManaPool(card: Card): boolean {
        const pool = this.manaPools[card.suit];
        if (!pool || pool.cards.length === 0) return false;
        return pool.cards[pool.cards.length - 1] === card;
    }

    private getCardIndices(card: Card | null): { handIndex: number; tableauIndex: number; tableauJndex: number } {
        if (!card) return { handIndex: -1, tableauIndex: -1, tableauJndex: -1 };

        const handIndex = this.hand.cards.indexOf(card);
        const tableauIndex = this.tableau.getColumns().findIndex(col => col.cards.includes(card));
        let tableauJndex = -1;
        
        if (tableauIndex !== -1) {
            const column = this.tableau.getColumn(tableauIndex);
            if (column) {
                tableauJndex = column.cards.indexOf(card);
            }
        }

        return { handIndex, tableauIndex, tableauJndex };
    }

    private moveCardToArea(card: Card, area: Area): void {
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(card);
        
        // Remove card from current location
        if (handIndex !== -1) {
            this.hand.cards.splice(handIndex, 1);
        } else if (tableauIndex !== -1) {
            const tableauColumn = this.tableau.getColumn(tableauIndex);
            if (tableauColumn && tableauJndex !== -1) {
                tableauColumn.remove(card);
                // Reveal the last card in the column if it exists
                if (tableauColumn.cards.length > 0) {
                    const lastCard = tableauColumn.cards[tableauColumn.cards.length - 1];
                    if (lastCard) lastCard.revealed = true;
                }
            }
        } else {
            // Card is in mana pools
            const manaPool = this.manaPools[card.suit];
            if (manaPool) {
                manaPool.removeCard(card);
            }
        }

        // Add card to target area
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

    // ==================== Observer Pattern ====================

    subscribe(fn: () => void): void {
        this.listeners.add(fn);
    }

    notify(): void {
        for (const fn of this.listeners) fn();
    }
}

// ==================== Composable ====================

const combatRef = ref<Combat | null>(null);

export function useCombat(): Combat {
    if (!combatRef.value) {
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

        // Whenever combat logic changes, notify Vue
        combat.subscribe(() => {
            triggerRef(combatRef);
        });

        combatRef.value = combat;
    }

    return combatRef.value as Combat;
}
