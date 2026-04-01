import Enemy, {
    buildDeckFromPattern,
    combineActionGenerators,
    conditionalActionGenerator,
    createSequentialActionGenerator,
    enemyActionFromKey,
} from "../Enemy";

export default class TacticianEnemy extends Enemy {
    constructor() {
        super({
            name: "Tactician",
            health: 30,
            generateTurnActions: combineActionGenerators(
                // Always performs a base melee attack every turn.
                createSequentialActionGenerator(() => buildDeckFromPattern(["weakAttack"])),

                // Chooses attack type based on current player block.
                conditionalActionGenerator(
                    ({ player }) => player.block >= 10,
                    () => [enemyActionFromKey("weakMagicAttack")],
                    () => [enemyActionFromKey("weakRangedAttack")]
                ),

                // Every 3rd turn, adds an extra block action.
                conditionalActionGenerator(
                    ({ turnNumber }) => turnNumber % 3 === 0,
                    () => [enemyActionFromKey("block")]
                )
            ),
        });
    }
}
