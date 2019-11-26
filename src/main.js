import {Game} from "./scenes/Game.js";
import {EndGame} from "./scenes/EndGame.js";

let config = {
    type: Phaser.AUTO,
    width: 1160,
    height: 760,
    scene: [Game, EndGame]
};

new Phaser.Game(config);