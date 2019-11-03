import {Game} from "./scenes/Game.js";

let config = {
    type: Phaser.AUTO,
    width: 1160,
    height: 760,
    scene: [Game]
};

new Phaser.Game(config);