import {Game} from "./scenes/Game.js";
import {EndMenu} from "./scenes/EndMenu.js";
import {MainMenu} from "./scenes/MainMenu.js";
import {Load} from "./scenes/Load.js";
import {Replay} from "./scenes/Replay.js";
import {UserReplays} from "./scenes/UserReplays.js";

let config = {
    type: Phaser.AUTO,
    width: 1160,
    height: 760,
    scene: [Load, MainMenu, Game, UserReplays, Replay, EndMenu]
};

new Phaser.Game(config);