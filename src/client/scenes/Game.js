import {GameMap} from "../../api/GameMap.js";
import {FieldEnum} from "../../enums/FieldEnum.js";
import {Point} from "../../api/Point.js";
import {User} from "../../api/User.js";
import {User2} from "../../api/User2.js";
import {socket} from "./MainMenu.js";

let gameMap,
    users,
    user,
    user2,
    keys,
    spawned,
    result,
    endGame;

export class Game extends Phaser.Scene {

    constructor() {
        super({key: "Game"});
    }

    create() {
        spawned = false;
        gameMap = new GameMap();
        gameMap.game = this;
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

        socket.connect().emit('spawn');

        socket.on('spawn', this.handleSpawn);
        socket.on('placeBomb', this.handlePlaceBomb);
        socket.on('newUser', this.handleNewUser);
        socket.on('explode', this.handleExplode);
        socket.on('move', this.handleMove);
    }


    update() {
        //this.graphics.clear();
        //this.draw(this.graphics);

        if (spawned) {
            if (keys.get('A').isDown) this.move(user.x - 1, user.y);
            if (keys.get('S').isDown) this.move(user.x, user.y + 1);
            if (keys.get('D').isDown) this.move(user.x + 1, user.y);
            if (keys.get('W').isDown) this.move(user.x, user.y - 1);
            if (keys.get('Space').isDown) this.placeBomb();
        }

        for (const u of users.values()) {
            if (user !== u)
                u.drawOtherUser(this.graphics, true);
        }
        if (endGame) this.endGame(result);
    }

    handleSpawn = (data) => {
        if(user2 != null) return;

        console.log("spawn");
        console.log(data);

        gameMap.map = data.map;
        this.drawMap();

        let otherUserSprite = this.add
            .sprite(
                user.x * 40 + 20,
                user.y * 40 + 20,
                'player0', 10)
            .setScale(0.33);
        let u2 = new Map(JSON.parse(data.users));
        for (let [key, value] of u2.entries()) {
            users.set(key, new User(value.username, value.x, value.y, null, otherUserSprite));
        }

        user = users.get(socket.id);

        let userSprite = this.add.sprite(user.x * 40 + 20, user.y * 40 + 20, 'player0', 10).setScale(0.33);
        user2 = new User2("?", userSprite, "?");

        spawned = true;

    }

    drawMap() {
        for (let i = 0; i < gameMap.map.length; i++) {
            for (let j = 0; j < gameMap.map[0].length; j++) {
                const field = gameMap.map[i][j];
                if (field.fieldType === FieldEnum.EMPTY) {
                    let sp = this.add
                        .sprite(j * 40 + 20, i * 40 + 20, 'grass')
                        .setScale(0.5);
                    field.sp = sp;
                } else if (field.fieldType === FieldEnum.STONE) {
                    let sp = this.add.sprite(j * 40 + 20, i * 40 + 20, 'stone');
                    field.sp = sp;
                } else if (field.fieldType === FieldEnum.BARRICADE) {
                    let sp = this.add
                        .sprite(j * 40 + 20, i * 40 + 20, 'ice')
                        .setScale(0.5);
                    field.sp = sp;
                } else {
                    this.graphics.fillStyle(0x000000, 1.0);
                    this.graphics.fillRect(j * 40, i * 40, 40, 40);
                }
            }
        }
    }

    placeBomb() {
        socket.emit('placeBomb');
    }

    handlePlaceBomb = (pos) => {
        if(gameMap.placeBomb(pos.x, pos.y, this))
            this.add.sprite(pos.x * 40 + 20, pos.y * 40 + 20, 'bomb').setScale(0.33);
    }

    handleNewUser = (data) => {
        if (!spawned) return;
        users.set(data.id, new User(data.username, data.user.x, data.user.y, null));
        gameMap.clearForPlayer(data.user.x, data.user.y);
    }

    move(x, y) {
        if (!user.inTransit && gameMap.map[y][x].fieldType === FieldEnum.EMPTY) {

            user.transit(x, y);
            socket.emit('move', new Point(x, y));

            user2.transit(x, y, this.tweens);
        }
    }

    endGame(result) {
        this.scene.start("EndMenu", {result: result});
    }

    handleExplode = (pos) => {
        let detonated = gameMap.detonate(pos.x, pos.y, this);

        console.log(detonated);

        for (let i = 0; i < detonated.length; i++) {
            let x = detonated[i].x;
            let y = detonated[i].y;

            // Запазване на координатите
            let coordinates = { x, y };

            let sprite = this.add
                .sprite(
                    detonated[i].x * 40 + 20,
                    detonated[i].y * 40 + 20,
                    'explode')
                .setScale(0.33);

            // Използване на `setTimeout` за забавяне на премахването с 5 секунди
            setTimeout(() => {
                sprite.destroy();

                // Задайте текстурата и мащаба на "grass"
                console.log(y, x);
                console.log(gameMap.map[y][x]);

                gameMap.map[y][x].sp.setTexture("grass").setScale(0.5);
            }, 200);
        }
    };

    handleMove = (data) => {
        if (!spawned) return;
        if (data.id === socket.id) {
            console.warn("Rollback detected!");
            user.inTransit = false;
            user.transitionX = 0;
            user.transitionY = 0;
        }

        users.get(data.id).transit(data.pos.x, data.pos.y);

        users.get(data.id).hero.x = data.pos.x * 40 + 20;
        users.get(data.id).hero.y = data.pos.y * 40 + 20;
    }
}

socket.on('disconnectUser', function (id) {
    if (!spawned) return;
    users.delete(id);
});

socket.on('endGame', function (data) {
    endGame = true;
    result = data;
    spawned = false;
    socket.disconnect();
});