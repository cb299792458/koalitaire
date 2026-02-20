import type Player from "./Player";

export interface Event {
    name: string;
    description: string;
    options: EventOption[];
}

export interface EventOption {
    stat: 'attack' | 'agility' | 'arcane' | 'appeal' | 'armor' | '';
    description: string;
    success?: {
        effect: (player: Player) => void;
        message: string;
    };
    failure?: {
        effect: (player: Player) => void;
        message: string;
    };
}

const lockedChest: Event = {
    name: 'Locked Chest',
    description: 'You happen upon a locked chest. What do you do?',
    options: [
        {
            stat: 'attack',
            description: 'Try to break open the chest by force.',
            success: {
                effect: (player: Player) => {
                    player.gold += 100;
                },
                message: 'You break open the chest and find an antique didgeridoo, inlaid with opals. You can sell it in town for 100 gold.',
            },
            failure: {
                effect: (player: Player) => {
                    player.gold += 10;
                    player.takeDamage(10);
                },
                message: 'You hurt your paw breaking open the chest, taking 10 damage. You also destroy the antique didgeridoo inside, but pick up some valuable scraps.',
            },
        },
        {
            stat: 'agility',
            description: 'Try to pick the lock with your claws.',
            success: {
                effect: (player: Player) => {
                player.gold += 100;
                },
                message: 'You pick the lock with your claws and find an antique didgeridoo, inlaid with opals. You can sell it in town for 100 gold.',
            },
            failure: {
                effect: (_player: Player) => {
                },
                message: 'You fail to pick the lock and move on, frustrated.',
            },
        }
    ]
}

const bandits: Event = {
    name: 'Bandits',
    description: 'You encounter a group of bandits who are holding a merchant at crossbow point, rummaging through his goods. What do you do?',
    options: [
        {
            stat: 'armor',
            description: 'Try to block the crossbow with your armor shield.',
            success: {
                effect: (player: Player) => {
                    player.gold += 100;
                },
                message: 'You protect the merchant with your armor and he rewards you with 100 gold.',
            },
            failure: {
                effect: (player: Player) => {
                    player.takeDamage(20);
                },
                message: 'The bandits fire their crossbow and hit you instead. You take 20 damage, and the bandit runs off.',
            },
        },
        {
            stat: 'appeal',
            description: 'Try to scare the bandits into leaving the merchant alone.',
            success: {
                effect: (player: Player) => {
                    player.gold += 100;
                },
                message: 'You convince the bandits that it\'s not worth it to fight you, and they leave the merchant alone. He gives you 100 gold for your help.',
            },
            failure: {
                effect: (player: Player) => {
                    player.gold -= 100;
                    player.gold = Math.max(0, player.gold);
                },
                message: 'A few more bandits arrive they rob you as well. You lose 100 gold.',
            },
        },
    ]
}

const swagman: Event = {
    name: 'Swagman',
    description: 'A jolly swagman camped by a billabong welcomes you to join him before he goes waltzing matilda. He says he\'s waiting till his billy boils, having just caught a stray jumbuck. If you can guess what he\'s cooking, he\'ll share it with you.',
    options: [
        {
            stat: '',
            description: 'A goat',
            failure: {
                effect: (_player: Player) => {},
                message: 'You guess incorrectly and the swagman laughs, "Not from around here, are ya?".',
            },
        },
        {
            stat: '',
            description: 'A sheep',
            success: {
                effect: (player: Player) => {
                    player.gainHealth(25);
                },
                message: 'You guess correctly and the swagman gives you a free meal, restoring 25 health.',
            },
        },
        {
            stat: '',
            description: 'A deer',
            failure: {
                effect: (_player: Player) => {},
                message: 'You guess incorrectly and the swagman laughs, "Not from around here, are ya?".',
            },
        },
        {
            stat: '',
            description: 'A chocolate cake',
            failure: {
                effect: (player: Player) => {
                    player.gold += 15;
                },
                message: 'He says, "I understood that reference." in a perfect Chris Evans impression. That\'s not right, but thanks for the laugh. He gives you 15 gold.',
            },
        },
    ],
}

const storm: Event = {
    name: 'Storm',
    description: 'You come across a few travelers struggling to set up a tent. They say, "Can\'t you hear, can\'t you hear the thunder? You better run, you better take cover."',
    options: [
        {
            stat: 'arcane',
            description: 'Summon a magical brolly for yourself and the travelers.',
            success: {
                effect: (player: Player) => {
                    player.gold += 15;
                },
                message: 'You summon a magical brolly for yourself and the travelers. You all stay dry, and they offer some gold as thanks.',
            },
            failure: {
                effect: (player: Player) => {
                    player.takeDamage(10);
                },
                message: 'You try to summon a magical brolly, but it gets blown away by the wind. You catch a cold in the rain, taking 10 damage.',
            },
        },
        {
            stat: '',
            description: 'Help the travelers set up their tent.',
            success: {
                effect: (player: Player) => {
                    player.gainHealth(10);
                },
                message: 'You help the travelers set up their tent. They give you a vegemite sandwich as thanks. You restore 10 health.',
            },
            failure: {
                effect: (player: Player) => {
                    player.takeDamage(10);
                },
                message: 'You try to help the travelers set up their tent, but it starts to rain harder. You catch a cold in the rain, taking 10 damage.',
            },
        },
    ],
}

export const events: Event[] = [
    lockedChest,
    swagman,
    bandits,
    storm,
]
