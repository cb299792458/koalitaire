<script setup lang="ts">
    import { onMounted, onBeforeUnmount, ref, unref, computed } from 'vue';
    import { useTown, type StatStoreId } from '../composables/useTown';
    import PlayerInfo from './PlayerInfo.vue';

    const town = useTown();
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
        { id: 'agilityStore', label: 'The Arcade Pyre', welcomeMessage: "Sleeping is giving in, hop on any of our game cabinets and your reflexes will wake up." },
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

    const firstRowPlaces = computed(() => visiblePlaces.value.slice(0, 2));
    const secondRowPlaces = computed(() => visiblePlaces.value.slice(2));

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
    }

    const canRestAtInn = () => {
        const p = unref(player);
        const used = unref(innUsedThisVisit);
        if (!p || used) return false;
        return p.health < p.maxHealth;
    };

    function restAtInn() {
        town.restAtInn();
    }

    const bloodbankHpCost = () => town.getBloodbankHpCost(unref(player)?.maxHealth ?? 0);
    const bloodbankGoldReward = () => town.getBloodbankGoldReward();

    const canSellBlood = () => {
        const p = unref(player);
        if (!p) return false;
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
                            <div class="town-places">
                                <div class="town-places-row">
                                    <button
                                        v-for="place in firstRowPlaces"
                                        :key="place.id"
                                        type="button"
                                        class="town-place"
                                        @click="onPlaceClick(place.id)"
                                    >
                                        {{ place.label }}
                                    </button>
                                </div>
                                <div class="town-places-row">
                                    <button
                                        v-for="place in secondRowPlaces"
                                        :key="place.id"
                                        type="button"
                                        class="town-place"
                                        @click="onPlaceClick(place.id)"
                                    >
                                        {{ place.label }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="town-right">
                            <div class="town-location">
                                <p class="town-location-welcome">{{ locationWelcomeMessage() }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="town-bottom">
                        <div class="town-choices">
                            <template v-if="currentLocation === 'inn'">
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canRestAtInn()"
                                    @click="restAtInn"
                                >
                                    {{ innUsedThisVisit ? 'Already rested' : 'Rest (heal 75% of missing health)' }}
                                </button>
                            </template>
                            <template v-else-if="currentLocation === 'bloodbank'">
                                <button
                                    type="button"
                                    class="town-choice-button"
                                    :disabled="!canSellBlood()"
                                    @click="sellBlood"
                                >
                                    Sell blood (−{{ bloodbankHpCost() }} HP, +{{ bloodbankGoldReward() }} 🍃)
                                </button>
                            </template>
                            <template v-else-if="currentLocation === 'store'">
                                <p class="town-placeholder-msg">Buying cards coming soon.</p>
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
                                <p class="town-placeholder-msg">Work in progress.</p>
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
                        </div>
                        <button type="button" class="leave-town-button" @click="leave">
                            Leave
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

    .town-places {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: center;
        justify-content: center;
        padding: 24px;
    }

    .town-places-row {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        justify-content: center;
        align-items: center;
    }

    .town-place {
        padding: 24px 48px;
        font-size: 1.25rem;
        background-color: #4a7c59;
        color: #f0e6d3;
        border: 2px solid #3d6b4a;
        border-radius: 12px;
        cursor: pointer;
        min-width: 140px;
    }

    .town-place:hover {
        background-color: #5a9c69;
    }

    .town-location {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 16px;
        color: #f0e6d3;
    }

    .town-location-welcome {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
        text-align: center;
        color: black;
    }

    .town-choices {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
    }

    .town-placeholder-msg {
        margin: 0;
        color: black;
        font-size: 1.1rem;
        font-style: italic;
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
</style>
