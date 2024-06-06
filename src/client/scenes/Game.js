import {GameMap} from "../../api/GameMap.js";
import {FieldEnum} from "../../enums/FieldEnum.js";
import {Point} from "../../api/Point.js";
import {User} from "../../api/User.js";
import {User2} from "../../api/User2.js";
import {socket} from "./MainMenu.js";
import {Bombs} from "../../api/Bombs.js";
import {gameConfig} from "../../../config/gameConfig.js";

let gameMap,
    users,
    user,
    user2,
    keys,
    inGame,
    result,
    bombs,
    endGame;

export class Game extends Phaser.Scene {

    constructor() {
        super({key: "Game"});
    }

    create() {
        inGame = false;
        gameMap = new GameMap();
        users = new Map();
        user = new User();
        bombs = new Bombs();

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
        if (inGame) {
            if (keys.get('A').isDown) this.move(user.x - 1, user.y);
            if (keys.get('S').isDown) this.move(user.x, user.y + 1);
            if (keys.get('D').isDown) this.move(user.x + 1, user.y);
            if (keys.get('W').isDown) this.move(user.x, user.y - 1);
            if (keys.get('Space').isDown) this.placeBomb();
        }

        if (endGame) this.endGame(result);
    }

    handleSpawn = (data) => {

        gameMap = new GameMap();
        gameMap.map = data.map;
        this.drawMap();

        let u2 = new Map(JSON.parse(data.users));
        for (let [key, value] of u2.entries()) {
            let otherUserSprite = this.add
                .sprite(
                    value.x * gameConfig.GRID_CELL_SIZE + gameConfig.GRID_CELL_SIZE/2,
                    value.y * gameConfig.GRID_CELL_SIZE + gameConfig.GRID_CELL_SIZE/2,
                    'player0', 10)
                .setScale(0.33);

            users.set(
                key,
                new User2(
                    value.username,
                    otherUserSprite,
                    value.x,
                    value.y));
        }

        user2 = users.get(socket.id);
        user = new User("", user2.x, user2.y);

        inGame = true;

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
        if(gameMap.placeBomb(pos.x, pos.y, this)) {
            let sprite = this.add.sprite(pos.x * 40 + 20, pos.y * 40 + 20, 'bomb').setScale(0.33);

            let bombX = pos.x;
            let bombY = pos.y;
            bombs.addBomb(bombX, bombY, sprite);

            setTimeout(() => {
                bombs.removeBomb(bombX, bombY);
                //sprite.destroy();

            }, 990);
        }
    }

    handleNewUser = (data) => {
        if (!inGame) return;

        let userSprite = this.add
            .sprite(data.user.x * 40 + 20, data.user.y * 40 + 20, 'player0', 10)
            .setScale(0.33);
        users.set(data.id, new User2(data.username, userSprite, data.user.x, data.user.y));
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
        let detonated = gameMap.detonate(pos.x, pos.y);

        bombs.removeBombs(detonated);

        for (let i = 0; i < detonated.length; i++) {
            let x = detonated[i].x;
            let y = detonated[i].y;

            let sprite = this.add
                .sprite(
                    detonated[i].x * 40 + 20,
                    detonated[i].y * 40 + 20,
                    'explode', 0)
                .setScale(0.33);

            let textureIndex = 0; // индекс на текстурата
            let totalTextures = 6;

            // Използване на `setInterval` за забавяне на премахването с 1 секунда
            let interval = setInterval(() => {
                // if game ends (explosion kills player)
                if (endGame || !inGame) {
                    clearInterval(interval);
                    return;
                }

                if (textureIndex >= totalTextures || !sprite.texture) {
                    clearInterval(interval); // спиране на интервала след последната текстура
                    sprite.destroy();
                    gameMap.map[y][x].sp.setTexture("grass").setScale(0.5);
                    return;
                }

                sprite.setTexture("explode", textureIndex).setScale(0.33);
                textureIndex++; // увеличаване на индекса за следващата текстура
            }, 12); // интервалът е на всяка секунда
        }
    };

    handleMove = (data) => {
        if (!inGame) return;
        if (data.id === socket.id) {
            console.warn("Rollback detected!");
            user.inTransit = false;
            user.transitionX = 0;
            user.transitionY = 0;

            user2.hero.x = data.pos.x * 40 + 20;
            user2.hero.y = data.pos.y * 40 + 20;
            user2.inTransit = false;
        }

        users.get(data.id).transit(data.pos.x, data.pos.y, this.tweens);
    }
}

socket.on('disconnectUser', function (id) {
    if (!inGame) return;
    users.delete(id);
});

socket.on('endGame', function (data) {
    bombs = null;
    endGame = true;
    result = data;
    inGame = false;

    socket.disconnect();
});