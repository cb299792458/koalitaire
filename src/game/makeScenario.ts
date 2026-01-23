import Enemy, { platypusParams, dwambatParams, gnokkaParams, squirrelfParams, dingorcParams } from "../models/Enemy";

export default function makeScenario () {
    return [
        null, 
        { enemy: new Enemy(platypusParams.name, platypusParams.portrait, platypusParams.health, platypusParams.makeDeck) },
        { enemy: new Enemy(dwambatParams.name, dwambatParams.portrait, dwambatParams.health, dwambatParams.makeDeck) },
        { enemy: new Enemy(gnokkaParams.name, gnokkaParams.portrait, gnokkaParams.health, gnokkaParams.makeDeck) },
        { enemy: new Enemy(squirrelfParams.name, squirrelfParams.portrait, squirrelfParams.health, squirrelfParams.makeDeck) },
        { enemy: new Enemy(dingorcParams.name, dingorcParams.portrait, dingorcParams.health, dingorcParams.makeDeck) },
    ]
}
