import {GameMap} from "../api/GameMap.js";
import {FieldEnum} from "../enums/FieldEnum.js";
import {Point} from "../api/Point.js";
import {User} from "../api/User.js";

let socket = io();
let gameMap = new GameMap();
let users = new Map();

let user = new User(0,0,0);
let keys = [];
let spawned = false;

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
        keys.push(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));
    }

    update() {

        this.graphics.clear();
        for (let i = 0; i < gameMap.map.length; i++) {
            for (let j = 0; j < gameMap.map[0].length; j++) {
                if (gameMap.map[i][j] === FieldEnum.EMPTY)
                    this.graphics.fillStyle(0x009933, 1.0);
                else if (gameMap.map[i][j] === FieldEnum.STONE)
                    this.graphics.fillStyle(0x808080, 1.0);
                else if (gameMap.map[i][j] === FieldEnum.BARRICADE)
                    this.graphics.fillStyle(0x802b00, 1.0);
                else if (gameMap.map[i][j] === FieldEnum.EXPLOSION)
                    this.graphics.fillStyle(0xff0000, 1.0);
                else
                    this.graphics.fillStyle(0x000000, 1.0);
                this.graphics.fillRect(j * 40, i * 40, 40, 40);
            }
        }

        if(spawned && !user.inTransit) {
            let newPosition;
            if (keys[0].isDown && gameMap.map[user.y][user.x - 1] !== FieldEnum.STONE) { // A
                newPosition = new Point(user.x - 1, user.y);
            } else if (keys[1].isDown && gameMap.map[user.y + 1][user.x] !== FieldEnum.STONE) { // S
                newPosition = new Point(user.x, user.y + 1);
            } else if (keys[2].isDown && gameMap.map[user.y][user.x + 1] !== FieldEnum.STONE) { // D
                newPosition = new Point(user.x + 1, user.y);
            } else if (keys[3].isDown && gameMap.map[user.y - 1][user.x] !== FieldEnum.STONE) { // W
                newPosition = new Point(user.x, user.y - 1);
            }
            if(keys[4].isDown){
                gameMap.placeBomb(user.x, user.y);
            }

            if(newPosition !== undefined){
                socket.emit('move', newPosition);
                user.transit(newPosition.x, newPosition.y);
            }
        }

        for (const v of users.values()) {
            this.graphics.fillStyle(0x802bFF, 1.0);
            this.graphics.fillRect(v.x * v.size + v.transitionX, v.y * v.size + v.transitionY, 40, 40);
        }
        
    }

}

socket.on('spawn', function (data) {
    gameMap.map = data.map;
    let u2 = new Map(JSON.parse(data.users));
    for (let [key, value] of u2.entries()) {
        users.set(key, new User(value.x, value.y, 40));
    }
    user = users.get(socket.id);
    spawned = true;
});

socket.on('move', function (data) {
    if(! spawned) return;
    if(data.id === socket.id){
        console.warn("Rollback detected!");
        user.inTransit = false;
    }

    users.get(data.id).transit(data.pos.x, data.pos.y);
});

socket.on('newUser', function (data) {
    if(! spawned) return;
    users.set(data.id, new User(data.user.x, data.user.y, 40));
});

socket.on('disconnectUser', function (id) {
    if(! spawned) return;
    users.delete(id);
});