import {Game} from "./scenes/Game.js";
import {EndMenu} from "./scenes/EndMenu.js";
import {MainMenu} from "./scenes/MainMenu.js";
import {Load} from "./scenes/Load.js";
import {Replay} from "./scenes/Replay.js";
import {UserReplays} from "./scenes/UserReplays.js";
import {Messages} from "./scenes/Messages.js";

let config = {
    type: Phaser.AUTO,
    width: 1160,
    height: 760,
    scene: [Load, MainMenu, Game, UserReplays, Replay, EndMenu, Messages]
};

new Phaser.Game(config);