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
    background: #80d784;
}

.game-top {
    display: flex;
    flex-direction: row;
    height: 900px;
    min-height: 0;
}

.game-left,
.game-right {
    width: 230px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    padding: 8px 10px;
    background: rgba(163, 200, 216, 0.9);
    border-right: 1px solid rgba(57, 78, 89, 0.25);
}

.game-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 10px 14px 0;
    background: transparent;
}

.game-right {
    border-right: none;
    border-left: 1px solid rgba(57, 78, 89, 0.25);
}

.game-bottom {
    height: 180px;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-height: 0;
    padding: 8px 18px 12px;
    background: rgba(229, 188, 201, 0.88);
    border-top: 1px solid rgba(88, 58, 68, 0.2);
}
</style>
