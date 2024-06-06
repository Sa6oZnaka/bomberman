import {GameMap} from "../../api/GameMap.js";
import {ActionEnum} from "../../enums/ActionEnum.js";
import {User} from "../../api/User.js";
import {FieldEnum} from "../../enums/FieldEnum.js";
import {gameConfig} from "../../../config/gameConfig.js";
import {User2} from "../../api/User2.js";
import {Bombs} from "../../api/Bombs.js";

export class Replay extends Phaser.Scene {

    constructor() {
        super({key: "Replay"});
    }

    init(data) {
        let replayData = JSON.parse(data.replayData);
        this.username = data.username;
        this.gameMap = new GameMap();
        this.gameMap.initMap(replayData.map);
        this.actions = replayData.actions;
        this.startTime = replayData.startTime;
        this.users = new Map();
        this.bombs = new Bombs();

        this.drawMap();

        let u2 = new Map(JSON.parse(replayData.users));
        for (let [key, value] of u2.entries()) {
            let otherUserSprite = this.add
                .sprite(
                    value.x * gameConfig.GRID_CELL_SIZE + gameConfig.GRID_CELL_SIZE/2,
                    value.y * gameConfig.GRID_CELL_SIZE + gameConfig.GRID_CELL_SIZE/2,
                    'player0', 10)
                .setScale(0.33);

            this.users.set(
                key,
                new User2(
                    value.username,
                    otherUserSprite,
                    value.x,
                    value.y));
        }
    }

    create() {
        this.graphics = this.add.graphics();
        this.lastActionID = 0;
        this.date = new Date();
        this.timeDiff = this.date.getTime() - this.startTime;
        this.add.sprite(40, 20, 'backButton')
            .setInteractive()
            .on('pointerdown', (pointer) => {
                this.scene.start("MainMenu");
            })
    }

    update() {
        if (this.actions[this.lastActionID].timeStamp + this.timeDiff <= new Date().getTime()) {
            let action = this.actions[this.lastActionID];
            switch (action.type) {
                case ActionEnum.MOVE:

                    this.users.get(action.data.id).transit(action.data.point.x, action.data.point.y, this.tweens);
                    break;

                case ActionEnum.PLACE_BOMB:


                    let sprite = this.add.sprite(
                        action.data.point.x * 40 + 20,
                        action.data.point.y * 40 + 20, 'bomb')
                        .setScale(0.33);

                    let bombX = action.data.point.x;
                    let bombY = action.data.point.y;
                    this.bombs.addBomb(bombX, bombY, sprite);

                    setTimeout(() => {
                        this.bombs.removeBomb(bombX, bombY);
                        //sprite.destroy();

                        this.handleExplode(action.data.point.x, action.data.point.y);

                    }, 990);


                    this.gameMap.placeBomb(action.data.point.x, action.data.point.y);
                    setTimeout(() => {
                        if (this.gameMap.hasBomb(action.data.point.x, action.data.point.y))
                            this.gameMap.detonate(action.data.point.x, action.data.point.y);
                    }, 1000);
                    break;

                case ActionEnum.KILLED:
                    this.users.delete(action.data.id);
                    break;
                default:
                    console.warn("Action not found!");
            }
            if (this.lastActionID < this.actions.length - 1)
                this.lastActionID++;
        }

        console.log(this.actions.length, this.lastActionID);
        if(this.actions.length === this.lastActionID + 1){
            this.scene.start("MainMenu");
        }
    }

    handleExplode = (x, y) => {
        let detonated = this.gameMap.detonate(x, y);

        this.bombs.removeBombs(detonated);

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
                /*if (endGame || !inGame) {
                    clearInterval(interval);
                    return;
                }*/

                if (textureIndex >= totalTextures || !sprite.texture) {
                    clearInterval(interval); // спиране на интервала след последната текстура
                    sprite.destroy();
                    this.gameMap.map[y][x].sp.setTexture("grass").setScale(0.5);
                    return;
                }

                sprite.setTexture("explode", textureIndex).setScale(0.33);
                textureIndex++; // увеличаване на индекса за следващата текстура
            }, 12); // интервалът е на всяка секунда
        }
    };

    drawMap(gameMap) {

        console.log(this.gameMap.map[0][0]);

        for (let i = 0; i < this.gameMap.map.length; i++) {
            for (let j = 0; j < this.gameMap.map[0].length; j++) {
                const field = this.gameMap.map[i][j];

                console.log(field);

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

}
