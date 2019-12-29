import {GameMap} from "../api/GameMap.js";
import {FieldEnum} from "../enums/FieldEnum.js";
import {Point} from "../api/Point.js";
import {User} from "../api/User.js";

export let socket = io();
let gameMap,
    users,
    user,
    keys,
    spawned,
    result,
    endGame;

export class Game extends Phaser.Scene {

    constructor() {
        super({key: "Game"});
    }

    init(data){
        this.room = data.room;
    }

    create() {
        spawned = false;
        gameMap = new GameMap();
        users = new Map();
        user = new User();
        endGame = false;
        this.graphics = this.add.graphics();

        keys = new Map();
        keys.set('A', this.input.keyboard.addKey('A'));
        keys.set('S', this.input.keyboard.addKey('S'));
        keys.set('D', this.input.keyboard.addKey('D'));
        keys.set('W', this.input.keyboard.addKey('W'));
        keys.set('Space', this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));

        socket.connect().emit('spawn', this.room);
    }

    update() {
        this.graphics.clear();
        gameMap.draw(this.graphics);

        if (spawned) {
            if (keys.get('A').isDown) this.move(user.x - 1, user.y);
            if (keys.get('S').isDown) this.move(user.x, user.y + 1);
            if (keys.get('D').isDown) this.move(user.x + 1, user.y);
            if (keys.get('W').isDown) this.move(user.x, user.y - 1);
            if (keys.get('Space').isDown) this.placeBomb();
        }

        for (const user of users.values()) {
            user.draw(this.graphics);
        }
        if (endGame) this.endGame(result);
    }

    move(x, y) {
        if (!user.inTransit && gameMap.map[y][x] === FieldEnum.EMPTY) {
            user.transit(x, y);
            socket.emit('move', new Point(x, y));
        }
    }

    placeBomb() {
        socket.emit('placeBomb');
    }

    endGame(result) {
        this.scene.start("EndMenu", {result: result});
    }

}

socket.on('spawn', function (data) {
    gameMap.map = data.map;
    let u2 = new Map(JSON.parse(data.users));
    for (let [key, value] of u2.entries()) {
        users.set(key, new User(value.username, value.x, value.y, null));
    }
    user = users.get(socket.id);
    spawned = true;
});

socket.on('move', function (data) {
    if (!spawned) return;
    if (data.id === socket.id) {
        console.warn("Rollback detected!");
        user.inTransit = false;
        user.transitionX = 0;
        user.transitionY = 0;
    }

    users.get(data.id).transit(data.pos.x, data.pos.y);
});

socket.on('placeBomb', function (pos) {
    gameMap.placeBomb(pos.x, pos.y);
});

socket.on('explode', function (pos) {
    gameMap.detonate(pos.x, pos.y);
});

socket.on('newUser', function (data) {
    if (!spawned) return;
    users.set(data.id, new User(data.username,data.user.x, data.user.y, null));
    gameMap.clearForPlayer(data.user.x, data.user.y);
});

socket.on('disconnectUser', function (id) {
    if (!spawned) return;
    users.delete(id);
});

socket.on('endGame', function (data) {
    endGame = true;
    result = data;
    socket.disconnect();
});