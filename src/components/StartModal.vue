<script setup lang="ts">
    import Player, { koaParams, testCharacterParams, type PlayerParams } from '../models/Player';

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
    <div class="modal">
        <h2>Welcome to Koalitaire</h2>
        <p>Choose Your Character</p>
        
        <div class="character-list">
            <div
                v-for="character in characters"
                :key="character.name"
                class="character-item"
                @click="selectCharacter(character.params)"
            >
                <img :src="character.params.portrait" alt="Character Portrait" height="100px"/>
                {{ character.name }}
            </div>
        </div>
    </div>
</template>
