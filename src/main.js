import {Game} from "./scenes/Game.js";

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game]
};

new Phaser.Game(config);