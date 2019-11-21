import {GameMap} from "../api/GameMap.js";
import {FieldEnum} from "../enums/FieldEnum.js";
import {Point} from "../api/Point.js";
import {User} from "../api/User.js";

let socket = io();
let gameMap = new GameMap();
let users = new Map();

let user = new User(0, 0, 0);
let keys = new Map();
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

        keys.set('A', this.input.keyboard.addKey('A'));
        keys.set('S', this.input.keyboard.addKey('S'));
        keys.set('D', this.input.keyboard.addKey('D'));
        keys.set('W', this.input.keyboard.addKey('W'));
        keys.set('Space', this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));
    }

    update() {
        this.graphics.clear();
        gameMap.draw(this.graphics);

        if (spawned) {
            if (keys.get('A').isDown) this.move(user.x - 1, user.y);
            if (keys.get('S').isDown) this.move(user.x, user.y + 1);
            if (keys.get('D').isDown) this.move(user.x + 1, user.y);
            if (keys.get('W').isDown) this.move(user.x, user.y - 1);
            if (keys.get('Space').isDown) this.placeBomb(user.x, user.y);
        }

        for (const user of users.values()) {
            user.draw(this.graphics);
        }
    }

    move(x, y){
        if(! user.inTransit && gameMap.map[y][x] !== FieldEnum.STONE){
            user.transit(x, y);
            socket.emit('move', new Point(x, y));
        }
    }

    placeBomb(x, y){
        socket.emit('placeBomb', new Point(user.x, user.y));
        gameMap.placeBomb(x, y);
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
    if (!spawned) return;
    if (data.id === socket.id) {
        console.warn("Rollback detected!");
        user.inTransit = false;
    }

    users.get(data.id).transit(data.pos.x, data.pos.y);
});

socket.on('placeBomb', function (data) {
    gameMap.placeBomb(data.pos.x, data.pos.y);
});

socket.on('newUser', function (data) {
    if (!spawned) return;
    users.set(data.id, new User(data.user.x, data.user.y, 40));
});

socket.on('disconnectUser', function (id) {
    if (!spawned) return;
    users.delete(id);
});