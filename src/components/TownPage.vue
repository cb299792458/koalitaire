<script setup lang="ts">
    import { onMounted, onBeforeUnmount, ref, unref, computed } from 'vue';
    import { useTown, type StatStoreId } from '../composables/useTown';
    import { useModalState, closeModal } from '../stores/modalStore';
    import PlayerInfo from './PlayerInfo.vue';
    import SingleCard from './SingleCard.vue';
    import MapDeckModal from './MapDeckModal.vue';
    import { SpellCard } from '../models/Card';

    const town = useTown();
    const modalState = useModalState();
    const player = town.player;
    const innUsedThisVisit = town.innUsedThisVisit;

    function leave() {
        town.leaveTown();
    }

    const scale = ref(0.8);
    const designWidth = 1920;
    const designHeight = 1080;
    function updateScale() {
        scale.value = Math.min(
            window.innerWidth / designWidth,
            window.innerHeight / designHeight
        );
    }
    onMounted(() => {
        if (unref(town.isInTown)) setVisiblePlacesForVisit();
        updateScale();
        window.addEventListener('resize', updateScale);
        window.addEventListener('focus', updateScale);
    });
    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateScale);
        window.removeEventListener('focus', updateScale);
    });

    const townPlaces = [
        // always present
        { id: 'inn', label: 'Waldorf Australia', welcomeMessage: "Welcome to the Waldorf Australia. Come on in, we're not chockers yet!" },
        { id: 'store', label: 'Wentworth\'s Five and Dime', welcomeMessage: "Welcome to Wentworth's Five and Dime. It's just a name ya bogan, our cards are market prices." },

        // choose 4 at random
        { id: 'bloodbank', label: 'Southern Red Cross', welcomeMessage: "We've been having a bit of a shortage of blood lately, please give today at the Southern Red Cross." },
        { id: 'stockMarket', label: 'Redwall Street', welcomeMessage: "Welcome to Redwall Street. We only deal in real bytecoins, give 'em a bite for yourself." },
        { id: 'trader', label: 'Tradies', welcomeMessage: "G'day mate! We tradies are just looking to swap a few cards after some hard yakka, fair dinkum."},
        { id: 'attackStore', label: 'Arsenal FU', welcomeMessage: "Ello gov'nor, how's your mother! Arsenal For You at your service — 'ave a butcher's and see wot tickles yer fancy!"},
        { id: 'armorStore', label: 'Block Booster', welcomeMessage: "Looking to armor up? Make it a Block Booster knight." },
        { id: 'arcaneStore', label: 'Waverly Place Library', welcomeMessage: "Name's Bobst. Wanna see this rabbit do a Harold Holt? No worries mate, she'll be apples." },
        { id: 'agilityStore', label: 'The Arcade Pyre', welcomeMessage: "Come on in and play games all night long to improve your reflexes. Sleeping is giving in, have a white monster and wake up." },
        { id: 'appealStore', label: 'Nobody Beats the Rizz', welcomeMessage: "Don't be a dag, I'll teach you how to rizz up any sheila before smoko." },
    ] as const;

    const FIXED_PLACE_IDS = ['inn', 'store'] as const;
    const OTHER_PLACE_IDS = ['bloodbank', 'stockMarket', 'trader', 'attackStore', 'armorStore', 'arcaneStore', 'agilityStore', 'appealStore'] as const;

    type TownPlaceId = typeof townPlaces[number]['id'];

    function shuffle<T>(array: readonly T[]): T[] {
        const out: T[] = [...array];
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = out[i]!;
            out[i] = out[j]!;
            out[j] = tmp;
        }
        return out;
    }

    const visiblePlaceIds = ref<TownPlaceId[]>([]);

    function setVisiblePlacesForVisit() {
        const randomFour = shuffle(OTHER_PLACE_IDS).slice(0, 4);
        visiblePlaceIds.value = [...FIXED_PLACE_IDS, ...randomFour] as TownPlaceId[];
    }

    const visiblePlaces = computed(() => {
        return visiblePlaceIds.value
            .map((id) => townPlaces.find((p) => p.id === id))
            .filter((p): p is (typeof townPlaces)[number] => p != null);
    });

    const currentLocation = ref<TownPlaceId | null>(null);

    const locationLabel = () => {
        if (!currentLocation.value) return 'Town';
        return townPlaces.find(p => p.id === currentLocation.value)?.label ?? 'Town';
    };

    const locationWelcomeMessage = () => {
        if (!currentLocation.value) return 'Welcome to town.';
        const place = townPlaces.find(p => p.id === currentLocation.value);
        return place?.welcomeMessage ?? `Welcome to ${locationLabel()}.`;
    };

    function onPlaceClick(placeId: typeof townPlaces[number]['id']) {
        currentLocation.value = placeId;
        if (placeId === 'store') town.refreshStoreCards();
        if (placeId === 'trader') town.refreshTraderOffers();
    }

    const canRestAtInn = () => {
        const p = unref(player);
        const used = unref(innUsedThisVisit);
        if (!p || used) return false;
        if (p.gold < town.getRestCost()) return false;
        return p.health < p.maxHealth;
    };

    function restAtInn() {
        town.restAtInn();
    }

    const bloodbankHpCost = () => town.getBloodbankHpCost(unref(player)?.maxHealth ?? 0);
    const bloodbankGoldReward = () => town.getBloodbankGoldReward();

    const bloodbankAtLimit = () => unref(town.bloodbankUseCount) >= town.getBloodbankMaxPerVisit();

    const canSellBlood = () => {
        const p = unref(player);
        if (!p) return false;
        if (bloodbankAtLimit()) return false;
        return p.health > bloodbankHpCost();
    };

    function sellBlood() {
        town.sellBloodAtBloodbank();
    }

    const STAT_STORE_LABELS: Record<StatStoreId, string> = {
        attackStore: 'Attack',
        armorStore: 'Armor',
        arcaneStore: 'Arcane',
        agilityStore: 'Agility',
        appealStore: 'Appeal',
    };

    const statStoreIds: StatStoreId[] = ['attackStore', 'armorStore', 'arcaneStore', 'agilityStore', 'appealStore'];

    const isStatStore = (loc: typeof currentLocation.value): loc is StatStoreId =>
        statStoreIds.includes(loc as StatStoreId);

    const getStatUpgradeCostFor = (storeId: StatStoreId) => {
        const counts = unref(town.statUpgradeCounts);
        const useCount = counts[storeId] ?? 0;
        return town.getStatUpgradeCost(storeId, useCount);
    };

    const canAffordStatUpgrade = (storeId: StatStoreId) => {
        const p = unref(player);
        if (!p) return false;
        return p.gold >= getStatUpgradeCostFor(storeId);
    };

    function upgradeStat(storeId: StatStoreId) {
        town.upgradeStatAtStore(storeId);
    }

    const bytecoinPrice = () => town.getBytecoinPrice(unref(player)?.level ?? 1);
    const canBuyBytecoin = () => (unref(player)?.gold ?? 0) >= bytecoinPrice();
    const canSellBytecoin = () => (unref(player)?.bytecoins ?? 0) >= 1;
    function buyBytecoin() { town.buyBytecoin(); }
    function sellBytecoin() { town.sellBytecoin(); }

    const storeDisplayCards = computed(() =>
        town.storeCards.value.map((params) => {
            const card = new SpellCard(
                params.rank,
                params.suit,
                params.name,
                params.description,
                params.effect,
                params.charges,
                params.keywords,
                params.flavorText
            );
            card.revealed = true;
            return { params, displayCard: card };
        })
    );

    const traderGeneralDisplayCards = computed(() =>
        town.traderOffers.value.map((offer) => {
            const params = offer.generalCard;
            const card = new SpellCard(
                params.rank,
                params.suit,
                params.name,
                params.description,
                params.effect,
                params.charges,
                params.keywords,
                params.flavorText
            );
            card.revealed = true;
            return card;
        })
    );
</script>

<template>
    <div class="game-page town-page">
        <div class="scale-wrapper">
            <div class="scale-container" :style="{ transform: `scale(${scale})` }">
                <div class="town-screen">
                    <div class="town-top">
                        <div class="town-left">
                            <h1>Player</h1>
                            <PlayerInfo v-if="player" :player="player" :show-bytecoins="(unref(player)?.bytecoins ?? 0) > 0" />
                        </div>

                        <div class="town-middle">
                            <MapDeckModal
                                v-if="modalState.currentModal?.name === 'mapDeck' && modalState.currentModal?.props"
                                :player="modalState.currentModal.props.player"
                                :scenario="modalState.currentModal.props.scenario"
                                :on-continue="modalState.currentModal.props.onContinue"
                                @close="closeModal"
                            />
                            <div v-else class="town-location-content">
                                <h2 class="town-location-name">{{ locationLabel() }}</h2>
                                <p class="town-location-description">{{ locationWelcomeMessage() }}</p>
                                <div class="town-choices">
                            <template v-if="currentLocation === 'inn'">
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canRestAtInn()"
                                    @click="restAtInn"
                                >
                                    {{ innUsedThisVisit ? 'Already rested' : `Rest (${town.getRestCost()} 🍃 — heal 75% of missing health)` }}
                                </button>
                            </template>
                            <template v-else-if="currentLocation === 'bloodbank'">
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canSellBlood()"
                                    @click="sellBlood"
                                >
                                    <template v-if="bloodbankAtLimit()">Already donated {{ town.getBloodbankMaxPerVisit() }} times this visit</template>
                                    <template v-else>Sell blood (−{{ bloodbankHpCost() }} HP, +{{ bloodbankGoldReward() }} 🍃)</template>
                                </button>
                            </template>
                            <template v-else-if="currentLocation === 'store'">
                                <div class="town-store-cards">
                                    <div
                                        v-for="{ params, displayCard } in storeDisplayCards"
                                        :key="params.name"
                                        class="town-store-card"
                                    >
                                        <div class="town-store-card-display">
                                            <SingleCard :card="displayCard" />
                                            <button
                                                type="button"
                                                class="town-store-buy-button"
                                                :disabled="!town.canBuyStoreCard(params.name)"
                                                @click="town.buyStoreCard(params)"
                                            >
                                                {{ town.isStoreCardPurchased(params.name) ? 'Sold' : `Buy (${town.getStoreCardPrice()} 🍃)` }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="currentLocation === 'stockMarket'">
                                <span class="town-stock-price">1 bytecoin = {{ bytecoinPrice() }} 🍃</span>
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canBuyBytecoin()"
                                    @click="buyBytecoin"
                                >
                                    Buy bytecoin
                                </button>
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canSellBytecoin()"
                                    @click="sellBytecoin"
                                >
                                    Sell bytecoin
                                </button>
                            </template>
                            <template v-else-if="currentLocation === 'trader'">
                                <div class="town-trader-slots">
                                    <div
                                        v-for="(offer, idx) in town.traderOffers.value"
                                        :key="idx"
                                        class="town-trader-slot"
                                    >
                                        <div class="town-trader-cards">
                                            <div class="town-trader-card-display">
                                                <SingleCard :card="offer.playerCard" />
                                                <span class="town-trader-label">Your card</span>
                                            </div>
                                            <span class="town-trader-arrow">⇄</span>
                                            <div class="town-trader-card-display">
                                                <SingleCard v-if="traderGeneralDisplayCards[idx]" :card="traderGeneralDisplayCards[idx]!" />
                                                <span class="town-trader-label">Trade for</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            class="town-choice-button town-trader-button"
                                            @click="town.doTrade(idx)"
                                        >
                                            Trade
                                        </button>
                                    </div>
                                    <p v-if="town.traderOffers.value.length === 0" class="town-placeholder-msg">No spell cards in your deck to trade.</p>
                                </div>
                            </template>
                            <template v-else-if="currentLocation && isStatStore(currentLocation)">
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canAffordStatUpgrade(currentLocation)"
                                    @click="upgradeStat(currentLocation)"
                                >
                                    Increase {{ STAT_STORE_LABELS[currentLocation] }} (−{{ getStatUpgradeCostFor(currentLocation) }} 🍃)
                                </button>
                            </template>
                            <template v-else>
                                <p class="town-placeholder-msg">Select a location to get started.</p>
                            </template>
                                </div>
                            </div>
                        </div>

                        <div class="town-right">
                            <h1>Locations</h1>
                            <div class="town-places">
                                <button
                                    v-for="place in visiblePlaces"
                                    :key="place.id"
                                    type="button"
                                    class="town-place"
                                    :class="{ 'town-place--selected': currentLocation === place.id }"
                                    @click="onPlaceClick(place.id)"
                                >
                                    {{ place.label }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="town-bottom">
                        <button type="button" class="leave-town-button" @click="leave">
                            Leave Town
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .town-page {
        background-color: #2d4a3e;
    }

    .town-screen {
        background-color: #2d4a3e;
    }

    .town-location-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 24px;
        gap: 16px;
        overflow-y: auto;
    }

    .town-location-name {
        margin: 0;
        font-size: 1.75rem;
        text-align: center;
        color: #333;
    }

    .town-location-description {
        margin: 0;
        font-size: 1.1rem;
        text-align: center;
        line-height: 1.5;
        color: #444;
    }

    .town-places {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        width: 100%;
        overflow-y: auto;
    }

    .town-place {
        padding: 14px 24px;
        font-size: 1rem;
        background-color: #4a7c59;
        color: #f0e6d3;
        border: 2px solid #3d6b4a;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
    }

    .town-place:hover {
        background-color: #5a9c69;
    }

    .town-place--selected {
        background-color: #3d6b4a;
        border-color: #2d5a3a;
        font-weight: bold;
    }

    .town-choices {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 12px;
    }

    .town-store-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
        align-items: flex-start;
    }

    .town-store-card {
        padding: 12px;
        background-color: rgba(0,0,0,0.1);
        border-radius: 8px;
    }

    .town-store-card-display {
        position: relative;
        transform: scale(0.9);
        transform-origin: top center;
    }

    .town-store-buy-button {
        position: absolute;
        bottom: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
        background-color: #4a7c59;
        color: #f0e6d3;
        border: 2px solid #3d6b4a;
        border-radius: 6px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 10;
    }

    .town-store-card-display:hover .town-store-buy-button {
        opacity: 1;
    }

    .town-store-buy-button:hover:not(:disabled) {
        background-color: #5a9c69;
    }

    .town-store-buy-button:disabled {
        cursor: not-allowed;
    }

    .town-store-card-display:hover .town-store-buy-button:disabled {
        opacity: 0.6;
    }

    .town-placeholder-msg {
        margin: 0;
        color: black;
        font-size: 1.1rem;
        font-style: italic;
    }

    .town-trader-slots {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        justify-content: center;
        align-items: flex-start;
    }

    .town-trader-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    .town-trader-cards {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .town-trader-card-display {
        position: relative;
        transform: scale(0.85);
        transform-origin: top center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .town-trader-label {
        font-size: 0.85rem;
        color: black;
    }

    .town-trader-arrow {
        font-size: 1.5rem;
        color: black;
    }

    .town-trader-button {
        margin-top: -8px;
    }

    .town-stock-price {
        color: black;
        font-size: 1rem;
    }

    .town-choice-button {
        padding: 1rem 1.5rem;
        font-size: 1rem;
        background-color: #4a7c59;
        color: #f0e6d3;
        border: 2px solid #3d6b4a;
        border-radius: 8px;
        cursor: pointer;
    }

    .town-choice-button:hover:not(:disabled) {
        background-color: #5a9c69;
    }

    .town-choice-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .leave-town-button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        background-color: #4a7c59;
        color: #f0e6d3;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        width: 200px;
        height: 100px;
        margin: 10px;
    }

    .leave-town-button:hover {
        background-color: #5a9c69;
    }

    .town-bottom {
        justify-content: center;
    }
</style>
