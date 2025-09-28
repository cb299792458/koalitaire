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
                        <div class="card-pile deck">deck</div>
                        <div class="card-pile recycle">recycle</div>
                        <div class="card-pile trash">trash</div>
                    </div>

                    <div class="mana-pool">
                        <div
                            class="card-pile mana-pile"
                            v-for="n in 4"
                            :key="n"
                        >
                            Mana {{ n }}
                        </div>
                    </div>
                </div>

                <div class="cards-bottom">
                    <div
                        class="card-pile tableau"
                        v-for="n in 7"
                        :key="n"
                    >
                        Tableau {{ n }}
                    </div>  
                </div>
            </div>

            <div class="game-right">
                <h1>Enemy</h1>
            </div>
        </div>

        <div class="game-bottom">
            <h1>Hand and Stuff</h1>
            <div class="cards-hand">
                <div class="card-pile hand" v-for="n in 7" :key="n">
                    Hand {{ n }}
                </div>
            </div>
        </div>
    </div>
</template>

