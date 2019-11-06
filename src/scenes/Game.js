import {GameMap} from "../api/GameMap.js";
import {FieldEnum} from "../enums/FieldEnum.js";

let socket = io();
let gameMap = new GameMap();

export class Game extends Phaser.Scene {

    constructor() {
        super({key: "Game"});
    }

    preload() {
        // load assets
    }

    create() {
        this.graphics = this.add.graphics();
        socket.emit('spawn', "");
    }

    update() {
        for (let i = 0; i < gameMap.map.length; i++) {
            for (let j = 0; j < gameMap.map[0].length; j++) {
                if (gameMap.map[i][j] === FieldEnum.EMPTY)
                    this.graphics.fillStyle(0x009933, 1.0);
                else if (gameMap.map[i][j] === FieldEnum.STONE)
                    this.graphics.fillStyle(0x808080, 1.0);
                else
                    this.graphics.fillStyle(0x802b00, 1.0);
                this.graphics.fillRect(j * 40, i * 40, 40, 40);
            }
        }
    }

}

socket.on('spawn', function (data) {
    gameMap.map = data.map;
});