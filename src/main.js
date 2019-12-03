import {Game} from "./scenes/Game.js";
import {EndMenu} from "./scenes/EndMenu.js";
import {MainMenu} from "./scenes/MainMenu.js";
import {LoadMenu} from "./scenes/LoadMenu.js";

let config = {
    type: Phaser.AUTO,
    width: 1160,
    height: 760,
    scene: [LoadMenu, MainMenu, Game, EndMenu]
};

new Phaser.Game(config);