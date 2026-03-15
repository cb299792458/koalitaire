import { ref, triggerRef, toRaw } from 'vue';

// Models
import Card, { SpellCard } from '../models/Card';
import { Suit, Suits } from '../models/Suit';
import Player from '../models/Player';
import Enemy from '../models/Enemy';
import DrawPile from '../models/DrawPile';
import CompostPile from '../models/CompostPile';
import TrashPile from '../models/TrashPile';
import Hand from '../models/Hand';
import Tableau from '../models/Tableau';
import ManaPools from '../models/ManaPools';

// Types & Constants
import { AREAS, type Area } from '../models/Areas';
import { openModal } from '../stores/modalStore';
import { playSound } from '../utils/sounds';
import type { ScenarioEntry } from '../game/makeScenario';

export class Combat {
    // Game entities
    player: Player;
    enemy: Enemy;
    /** The original player (persistent); combat uses a copy. HP is synced from copy to original at combat end. */
    originalPlayer: Player | null = null;
    
    // Game state
    selectedCard: Card | null;
    deck: DrawPile;
    compost: CompostPile;
    trash: TrashPile;
    hand: Hand;
    tableau: Tableau;
    manaPools: ManaPools;
    isProcessingTurn: boolean;
    isMovingToMana: boolean;

    /** Set to player.level at start of each combat; delayed callbacks check this to no-op if combat changed. */
    private level: number = 0;
    /** Resolves when current turn processing (endTurn, etc.) finishes. */
    private processingTurnResolve: (() => void) | null = null;
    private processingTurnPromise: Promise<void> = Promise.resolve();
    
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
        this.tableau = new Tableau(this.player.columnCount);
        this.isProcessingTurn = false;
        this.isMovingToMana = false;

        this.manaPools = new ManaPools();
    }

    // ==================== Lifecycle Methods ====================

    /**
     * Start a new combat by copying the given player and enemy.
     * The copy is used during combat so stat changes are not permanent.
     * HP changes are synced to the original at combat end.
     */
    async start(player: Player, enemy: Enemy): Promise<void> {
        // Wait for any in-progress turn processing (shuffle, dealing, etc.) to finish
        await this.processingTurnPromise;
        
        this.processingTurnPromise = new Promise<void>(resolve => {
            this.processingTurnResolve = resolve;
        });
        
        try {
            this.originalPlayer = player;
            this.player = player.copy();
            this.level = player.level; // Invalidate any pending delayed callbacks from previous combat
            this.player.originalPlayer = player;
            this.enemy = enemy;

            // Clear all piles first to ensure clean slate from any previous combat
            this.deck.clear();
            this.compost.clear();
            this.trash.clear();
            this.manaPools.clear();
            if (this.player) {
                this.hand = new Hand(this.player.handSlotCount);
            }
            
            // Reset game state
            if (this.player) {
                const deckCards = this.player.getCombatDeck();
                this.deck.initialize(deckCards);
            }

            this.initializeTableau();
            await this.shuffleDeck();
            this.dealTableau();
            
            // Reset player state
            if (this.player) {
                this.player.dodge = 0;
                this.player.block = 0;
                this.player.manaDiamonds = this.player.startingManaDiamonds;
            }
            
            this.startTurn();
            
            this.notify();
        } finally {
            this.processingTurnResolve?.();
            this.processingTurnResolve = null;
        }
    }

    // ==================== Turn Management ====================

    startTurn(): void {
        this.drawCards(this.player?.handSize ?? 5);

        if (!this.player) return;
        this.player.dodge = 0;
        this.player.block = 0;
        // Free cells (hand) persist; do not clear or draw into them
        this.drawCards(this.player.handSize ?? 0, true);
        
        if (!this.enemy) return;
        this.enemy.loadActions(this.enemy.actions);
        
        this.notify();
    }

    async endTurn(): Promise<void> {
        if (!this.player || !this.enemy) return;
        if (this.isProcessingTurn) return; // Prevent multiple simultaneous end turns

        this.isProcessingTurn = true;
        this.processingTurnPromise = new Promise<void>(resolve => {
            this.processingTurnResolve = resolve;
        });
        this.notify();

        // Free cells (hand) are not shuffled; leave them as-is.

        // Tableau + compost → deck (mana pools left unchanged), shuffle, redeal tableau
        for (const column of this.tableau.getColumns()) {
            this.deck.addCards([...column.cards]);
            column.cards = [];
        }
        this.compost.recycleInto(this.deck);
        await this.deck.shuffle();
        this.dealTableau();
        this.notify();

        try {
            await this.runRestOfTurn();
        } finally {
            this.isProcessingTurn = false;
            this.processingTurnResolve?.();
            this.processingTurnResolve = null;
            this.notify();
        }
    }

    /**
     * Summons, enemy actions, reshuffle if needed, then start new turn.
     */
    private async runRestOfTurn(): Promise<void> {
        if (!this.player || !this.enemy) return;

        for (const summon of this.player.summons) {
            this.enemy.takeDamage(summon.damage);
            summon.effect(this);
            this.notify();
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s pause after each summon
        }
        if (this.enemy.health <= 0) {
            this.defeatEnemy();
            return;
        }

        this.enemy.dodge = 0;
        this.enemy.block = 0;
        await this.enemy.executeActions(this.player, this);
        if (this.enemy.health <= 0) {
            this.defeatEnemy();
            return;
        }

        if (this.deck.isEmpty()) {
            this.compost.recycleInto(this.deck);
            await this.deck.shuffle();
        }

        this.startTurn();
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

        // Sync HP from combat copy to original so damage/healing persists
        if (this.player.originalPlayer) {
            this.player.originalPlayer.health = this.player.health;
        }
        
        // Open enemy defeated modal first; level is advanced when user clicks Continue.
        // Use combat.originalPlayer (not this.player) so we always pass the actual persistent player, not the combat copy.
        const persistentPlayer = this.originalPlayer ?? this.player;
        openModal('cardReward', {
            title: 'Enemy Defeated',
            player: persistentPlayer,
            onContinue: () => {
                if (this.onEnemyDefeatedContinue) {
                    this.onEnemyDefeatedContinue();
                }
                return false; // Don't emit close; we've opened backAtCamp modal
            },
        }, { keepOpen: true, transparentOverlay: true });
        
        if (this.onEnemyDefeated) {
            this.onEnemyDefeated();
        }
    }

    // ==================== Card Drawing & Deck Management ====================

    drawCards(count: number = 5, keepHand: boolean = false): void {
        // Move all cards from hand to compost
        if (!keepHand) {
            this.compost.addCards([...this.hand.cards]);
            this.hand.clear();
        }

        // Draw cards and add to hand synchronously so hand state is correct before any timeouts run.
        // (Stale timeouts from a previous combat would otherwise add old cards to the new hand.)
        const drawnCards = this.deck.drawMultiple(count);
        for (const card of drawnCards) {
            if (!card) continue;
            card.revealed = true;
            this.hand.addCard(card);
        }
        this.notify();

        // Stagger draw animations only (no state changes in timeouts)
        for (let i = 0; i < drawnCards.length; i++) {
            const card = drawnCards[i];
            if (!card) continue;
            this.runAfterDelay(i * 100, () => {
                playSound('draw');
                card.animateDraw();
            });
        }
    }

    async shuffleDeck(): Promise<void> {
        await this.deck.shuffle();
    }

    /** Run callback after delay; no-ops if combat has been restarted (level changed). */
    private runAfterDelay(ms: number, fn: () => void): void {
        const version = this.level;
        setTimeout(() => {
            if (this.level !== version) return;
            fn();
        }, ms);
    }

    // ==================== Tableau Management ====================

    initializeTableau(): void {
        this.tableau = new Tableau(this.player.columnCount);
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

            case AREAS.Hand: {
                // Empty slot: only accept placement of a valid card; otherwise do nothing (not clickable)
                if (!clickedCard && clickIndex !== undefined) {
                    if (this.selectedCard && this.canPlaceSelectedInHandSlot(clickIndex)) {
                        this.placeSelectedCardInHandSlot(clickIndex);
                    }
                    break;
                }
                // Clicked a card in hand: select/deselect
                this.isCardSelection(clickedCard);
                break;
            }

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
                    openModal('compost', { title: 'Compost', cards: this.compost.cards });
                }
                break;

            case AREAS.Trash:
                openModal('trash', { title: 'Trash', cards: this.trash.cards });
                break;

            default:
                break;
        }
    }

    private burnCard(): void {
        if (!this.selectedCard || !this.canBurnSelectedCard()) return;

        const selectedCard = this.selectedCard;
        playSound('mana', 'wav', 0.45);
        selectedCard.animateBurn();
        this.runAfterDelay(1200, () => {
            this.moveCardToArea(selectedCard, AREAS.ManaPools);
        }); // Match burn animation time (1.2s)

        this.setSelectedCard(null);
    }

    private castCard(): void {
        if (!this.selectedCard || !this.player || !this.enemy) return;
        if (!this.canCastSelectedCard()) return;

        const selectedCard = this.selectedCard;
        playSound('cast');
        selectedCard.animate();
        
        this.runAfterDelay(selectedCard.animationTime, () => {
            if (!this.player || !this.enemy) return;
            
            // Calculate and remove mana diamonds needed
            const manaPool = this.manaPools.getPool(selectedCard.suit);
            if (selectedCard.suit === Suit.Koala) {
                if (selectedCard.rank > 0) {
                    this.player.manaDiamonds -= selectedCard.rank;
                    if (this.player.manaDiamonds < 0) this.player.manaDiamonds = 0;
                }
            } else if (manaPool) {
                const manaDiamondsNeeded = selectedCard.rank - manaPool.cards.length;
                if (manaDiamondsNeeded > 0) {
                    this.player.manaDiamonds -= manaDiamondsNeeded;
                    if (this.player.manaDiamonds < 0) this.player.manaDiamonds = 0;
                }
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

            // Move the card: if it has finite charges, decrement; when charges hits 0, trash instead of compost
            if (selectedCard.isSpell) {
                const spellCard = selectedCard as SpellCard;
                if (Number.isFinite(spellCard.charges)) {
                    spellCard.charges = (spellCard.charges ?? 0) - 1;
                    if (spellCard.charges <= 0) {
                        this.moveCardToArea(selectedCard, AREAS.Trash);
                    } else {
                        this.moveCardToArea(selectedCard, AREAS.Compost);
                    }
                } else {
                    this.moveCardToArea(selectedCard, AREAS.Compost);
                }
            } else {
                this.moveCardToArea(selectedCard, AREAS.Compost);
            }

            if (this.checkEnemyDeath()) return;
            this.notify();
        });
        
        this.setSelectedCard(null);
    }

    canCastSelectedCard(): boolean {
        if (!this.selectedCard || !this.selectedCard.revealed || !this.player) return false;
        if (!this.selectedCard.isSpell) return false;
        if (!this.isCardInPlayablePosition(this.selectedCard)) return false;

        const { rank, suit } = this.selectedCard;

        // Koala (debug) suit: cost is rank, no mana pool needed
        if (suit === Suit.Koala) {
            return rank <= this.player.manaDiamonds;
        }

        const manaPool = this.manaPools.getPool(suit);
        if (!manaPool) return false;

        const manaDiamondsNeeded = rank - manaPool.cards.length;
        return manaDiamondsNeeded <= this.player.manaDiamonds;
    }

    /**
     * Get the number of mana diamonds needed to cast the selected card
     * Returns -1 if the card cannot be cast or calculation is not applicable
     */
    getManaDiamondsNeededForCast(): number {
        if (!this.selectedCard || !this.selectedCard.revealed || !this.player) return -1;
        if (!this.isCardInPlayablePosition(this.selectedCard)) return -1;

        const { rank, suit } = this.selectedCard;

        if (suit === Suit.Koala) {
            return rank > 0 ? rank : 0;
        }

        const manaPool = this.manaPools.getPool(suit);
        if (!manaPool) return -1;

        const manaDiamondsNeeded = rank - manaPool.cards.length;
        return manaDiamondsNeeded > 0 ? manaDiamondsNeeded : 0;
    }

    /**
     * Check if the selected card can be burned (moved to mana pool)
     * A card can be burned if it's from the hand or the last card in a tableau column,
     * and the mana pool has enough cards matching the card's rank
     * Spell cards cannot be burned
     */
    canBurnSelectedCard(): boolean {
        if (!this.selectedCard || !this.selectedCard.revealed) return false;
        if (this.selectedCard.isSpell) return false;
        if (!this.isCardInPlayablePosition(this.selectedCard)) return false;

        const { rank, suit } = this.selectedCard;
        // Check if mana pool has enough cards for burning
        const manaPool = this.manaPools.getPool(suit);
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
        if (!this.isCardInPlayablePosition(card)) return false;

        const manaPool = this.manaPools.getPool(card.suit);
        if (!manaPool) return false;
        return manaPool.hasEnoughManaForBurn(card.rank);
    }

    /**
     * Returns all cards that can be moved to any pile in manaPools.
     * Checks the top card of each tableau column and each card in the player's hand.
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
     * Returns all cards that could be burned to mana (revealed, not spell, pool has enough)
     * regardless of position. Used for hover highlight so any such card is highlighted.
     */
    getCardsThatCouldBeBurnedToMana(): Card[] {
        const out: Card[] = [];
        for (const column of this.tableau.getColumns()) {
            for (const card of column.cards) {
                if (!card.revealed || card.isSpell) continue;
                const pool = this.manaPools.getPool(card.suit);
                if (pool && pool.hasEnoughManaForBurn(card.rank)) out.push(card);
            }
        }
        for (const card of this.hand.cards) {
            if (!card.revealed || card.isSpell) continue;
            const pool = this.manaPools.getPool(card.suit);
            if (pool && pool.hasEnoughManaForBurn(card.rank)) out.push(card);
        }
        return out;
    }

    /**
     * Repeatedly moves cards from tableau bottoms and hand to their matching mana pools
     * until no more cards can be moved. Each card is animated with a short delay between moves.
     */
    moveAllPossibleToManaPools(): void {
        if (this.isMovingToMana) return;
        this.isMovingToMana = true;
        this.notify();
        this.scheduleNextMoveToMana();
    }

    private static readonly MOVE_TO_MANA_ANIMATION_MS = 250;
    private static readonly MOVE_TO_MANA_GAP_MS = 120;

    private scheduleNextMoveToMana(): void {
        const movable = this.getCardsMovableToManaPools();
        if (movable.length === 0) {
            this.isMovingToMana = false;
            this.notify();
            return;
        }
        const card = movable[0]!;
        playSound('mana', 'wav', 0.45);
        card.animateMoveToMana();
        this.notify();
        this.runAfterDelay(Combat.MOVE_TO_MANA_ANIMATION_MS, () => {
            this.moveCardToArea(card, AREAS.ManaPools);
            this.notify();
            this.runAfterDelay(Combat.MOVE_TO_MANA_GAP_MS, () => this.scheduleNextMoveToMana());
        });
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

    /**
     * Whether the selected card can be placed in the given hand (free cell) slot.
     * Slot must be empty. Only top card of tableau column, card in hand, or top of mana pool can move to hand.
     */
    canPlaceSelectedInHandSlot(slotIndex: number): boolean {
        if (!this.selectedCard || !this.selectedCard.revealed) return false;
        if (slotIndex < 0 || slotIndex >= this.hand.getSlotCount()) return false;
        if (this.hand.getSlot(slotIndex) != null) return false;

        const card = this.selectedCard;
        if (this.hand.getSlotIndex(card) !== -1) return true;
        if (this.isTopCardOfManaPool(card)) return true;
        const { tableauIndex, tableauJndex } = this.getCardIndices(card);
        if (tableauIndex !== -1) {
            const col = this.tableau.getColumn(tableauIndex);
            if (col && tableauJndex === col.size() - 1) return true;
        }
        return false;
    }

    private placeSelectedCardInHandSlot(slotIndex: number): void {
        const selectedCard = this.selectedCard;
        if (!selectedCard || !this.canPlaceSelectedInHandSlot(slotIndex)) return;

        playSound('move');
        selectedCard.animateTableauMove();
        this.runAfterDelay(450, () => {
            if (!this.canPlaceSelectedInHandSlot(slotIndex)) return;
            const card = this.selectedCard;
            if (!card) return;

            const handIndex = this.hand.getSlotIndex(card);
            if (handIndex !== -1) {
                this.hand.setSlot(handIndex, undefined);
                this.hand.setSlot(slotIndex, card);
            } else if (this.isTopCardOfManaPool(card)) {
                const pool = this.manaPools.getPool(card.suit);
                if (pool) {
                    pool.removeCard(card);
                    card.revealed = true;
                    this.hand.setSlot(slotIndex, card);
                }
            } else {
                const { tableauIndex, tableauJndex } = this.getCardIndices(card);
                if (tableauIndex !== -1) {
                    const column = this.tableau.getColumn(tableauIndex);
                    if (column && tableauJndex === column.size() - 1) {
                        column.remove(card);
                        if (column.cards.length > 0) {
                            const lastCard = column.cards[column.cards.length - 1];
                            if (lastCard) lastCard.revealed = true;
                        }
                        card.revealed = true;
                        this.hand.setSlot(slotIndex, card);
                    }
                }
            }
            this.setSelectedCard(null);
            this.notify();
        });
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
        const handIndex = this.hand.getSlotIndex(selectedCard);
        if (handIndex !== -1) {
            // Move from hand (free cell)
            playSound('move');
            selectedCard.animateTableauMove();
            this.runAfterDelay(450, () => {
                this.hand.setSlot(handIndex, undefined);
                selectedCard.revealed = true; // Tableau is always face up
                clickedColumn.add(selectedCard);
                this.setSelectedCard(null);
                this.notify();
            }); // Match animation time (400ms + 50ms delay)
            return;
        }
        if (this.isTopCardOfManaPool(selectedCard)) {
            // Move top card from mana pool to tableau
            const pool = this.manaPools.getPool(selectedCard.suit);
            if (!pool) return;
            playSound('move');
            selectedCard.animateTableauMove();
            this.runAfterDelay(450, () => {
                pool.removeCard(selectedCard);
                selectedCard.revealed = true; // Tableau is always face up
                clickedColumn.add(selectedCard);
                this.setSelectedCard(null);
                this.notify();
            });
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
            playSound('move');
            selectedCard.animateTableauMove();
            this.runAfterDelay(450, () => {
                const cardsToMove = selectedCardColumn.cards.slice(selectedCardJndex);
                for (const c of cardsToMove) c.revealed = true; // Tableau is always face up
                clickedColumn.cards.push(...cardsToMove);
                selectedCardColumn.cards.splice(selectedCardJndex, cardsToMove.length);

                // Reveal the new top of the source column (tableau always face up)
                if (selectedCardColumn.cards.length > 0) {
                    const lastCard = selectedCardColumn.cards[selectedCardColumn.cards.length - 1];
                    if (lastCard) lastCard.revealed = true;
                }
                this.setSelectedCard(null);
                this.notify();
            }); // Match animation time (400ms + 50ms delay)
            return; // Early return since we're handling notify in setTimeout
        }
    }

    // ==================== Card Movement ====================

    /** True if the card is the top (last) card in its mana pool. */
    private isTopCardOfManaPool(card: Card): boolean {
        const pool = this.manaPools.getPool(card.suit);
        if (!pool || pool.cards.length === 0) return false;
        return pool.cards[pool.cards.length - 1] === card;
    }

    private getCardIndices(card: Card | null): { handIndex: number; tableauIndex: number; tableauJndex: number } {
        if (!card) return { handIndex: -1, tableauIndex: -1, tableauJndex: -1 };

        const handIndex = this.hand.getSlotIndex(card);
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

    /** True if card is in hand or is the last (top) card in a tableau column — required for burn/cast. */
    private isCardInPlayablePosition(card: Card): boolean {
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(card);
        if (handIndex !== -1) return true;
        const column = this.tableau.getColumn(tableauIndex);
        return column != null && tableauJndex === column.size() - 1;
    }

    private moveCardToArea(card: Card, area: Area): void {
        const { handIndex, tableauIndex, tableauJndex } = this.getCardIndices(card);
        
        // Remove card from current location
        if (handIndex !== -1) {
            this.hand.setSlot(handIndex, undefined);
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
            const manaPool = this.manaPools.getPool(card.suit);
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
                const targetManaPool = this.manaPools.getPool(card.suit);
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

/** Ref to combat instance; triggerRef(combatRef) after mutating state so Vue computeds that read it re-run. */
export const combatRef = ref<Combat | null>(null);

/** Persists across GamePage mount/unmount so we only show the start modal once. */
export const hasChosenCharacterRef = ref(false);

/** Scenario is set once when the player chooses their character and does not change until page refresh. */
export const scenarioRef = ref<ScenarioEntry[][] | null>(null);

export function useCombat(): Combat {
    if (!combatRef.value) {
        const defaultPlayer = new Player({
            name: '',
            portrait: '',
            appeal: 0,
            attack: 0,
            armor: 0,
            agility: 0,
            acumen: 0,
            health: 0,
            koallarbucks: 0,
            bytecoins: 0,
            collection: [],
            manaDeck: {},
        });
        const defaultEnemy = new Enemy({
            name: '',
            portrait: '',
            health: 0,
            makeDeck: () => []
        });
        
        const combat = new Combat(defaultPlayer, defaultEnemy);

        // Whenever combat logic changes, notify Vue
        combat.subscribe(() => {
            triggerRef(combatRef);
        });

        combatRef.value = combat;
    }

    return combatRef.value as Combat;
}
