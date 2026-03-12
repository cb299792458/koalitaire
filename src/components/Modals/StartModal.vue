<script setup lang="ts">
    import Player, { koaParams, testCharacterParams, type PlayerParams } from '../../models/Player';

    const props = defineProps<{
        /** Called when character is selected. Return false to prevent closing (e.g. when opening another modal). */
        onSelect: (player: Player) => void | boolean;
    }>();

    const characters = [
        { name: 'Koa XIII', params: koaParams },
        { name: 'DJ Testo', params: testCharacterParams },
    ]

    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    function selectCharacter(params: PlayerParams) {
        const player = new Player(params);
        const result = props.onSelect(player);
        if (result !== false) {
            emit('close');
        }
    }
</script>

<template>
    <div class="start-modal">
        <h2>Welcome to Koalitaire</h2>
        <p>Choose Your Character</p>
        
        <div class="character-list">
            <div
                v-for="character in characters"
                :key="character.name"
                class="character-item clickable"
                @click="selectCharacter(character.params)"
            >
                <img :src="character.params.portrait" alt="Character Portrait" height="100px"/>
                {{ character.name }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.start-modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 50%;
    gap: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.character-list {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
}

.character-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    transition: background 0.2s, border-color 0.2s;
}

.character-item:hover {
    background: #f0f0f0;
    border-color: #999;
}
</style>
