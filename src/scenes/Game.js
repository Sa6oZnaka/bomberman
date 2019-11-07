import {GameMap} from "../api/GameMap.js";
import {FieldEnum} from "../enums/FieldEnum.js";
import {User} from "../api/User.js";

let socket = io();
let gameMap = new GameMap();
let user = new User(1,1, 40);

let keys = [];

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

        keys.push(this.input.keyboard.addKey('A'));
        keys.push(this.input.keyboard.addKey('S'));
        keys.push(this.input.keyboard.addKey('D'));
        keys.push(this.input.keyboard.addKey('W'));
    }

    update() {
        this.graphics.clear();
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
        if(keys[0].isDown && gameMap.map[user.y][user.x - 1] !== FieldEnum.STONE)
            user.transit(user.x - 1, user.y);
        if(keys[1].isDown && gameMap.map[user.y + 1][user.x] !== FieldEnum.STONE)
            user.transit(user.x, user.y + 1);
        if(keys[2].isDown && gameMap.map[user.y][user.x + 1] !== FieldEnum.STONE)
            user.transit(user.x + 1, user.y);
        if(keys[3].isDown && gameMap.map[user.y - 1][user.x] !== FieldEnum.STONE)
            user.transit(user.x, user.y - 1);
        user.draw(this.graphics);
    }

}

socket.on('spawn', function (data) {
    gameMap.map = data.map;
});