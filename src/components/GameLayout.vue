<script setup lang="ts">
</script>

<template>
    <div class="game-layout">
        <div class="game-top">
            <div class="game-left">
                <slot name="left" />
            </div>
            <div class="game-center">
                <slot name="center" />
            </div>
            <div class="game-right">
                <slot name="right" />
            </div>
        </div>
        <div class="game-bottom">
            <slot name="bottom" />
        </div>
    </div>
</template>

<style scoped>
.game-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.game-top {
    display: flex;
    flex-direction: row;
    height: 860px;
    min-height: 0;
}

.game-left,
.game-right {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 0;
    background-color: lightblue;
}

.game-center {
    width: 1400px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: lightgreen;
}

.game-bottom {
    height: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-height: 0;
    background-color: pink;
}
</style>
