import Enemy, { platypusParams } from "../models/Enemy";

export default function makeScenario () {
    const { name, portrait, health, makeDeck } = platypusParams;
    return [
        null, 
        { enemy: new Enemy(name, portrait, health, makeDeck) },
        { enemy: new Enemy(name, portrait, health, makeDeck) },
        { enemy: new Enemy(name, portrait, health, makeDeck) },
        { enemy: new Enemy(name, portrait, health, makeDeck) },
        { enemy: new Enemy('Elite ' + name, portrait, 3 * health, makeDeck) },
    ]
}
