<script setup lang="ts">
    import Player, { koaParams, nextCharacterParams, type PlayerParams } from '../models/Player';

    const props = defineProps<{
        setPlayer: (player: Player) => void;
    }>();

    const characters = [
        { name: 'Koa XII', params: koaParams },
        { name: 'don\'t click this', params: nextCharacterParams },
    ]

    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    function selectCharacter(character: { name: string; params: PlayerParams }) {
        props.setPlayer(new Player(character.params));
        emit('close');
    }
</script>

<template>
    <div class="modal">
        <h2>Welome to Koalitaire</h2>
        <p>Choose Your Character</p>
        
        <div class="character-list">
            <div
                v-for="character in characters"
                :key="character.name"
                class="character-item"
                @click="selectCharacter(character)"
            >
                <img :src="character.params.portrait" alt="Character Portrait" height="100px"/>
                {{ character.name }}
            </div>
        </div>
    </div>
</template>
