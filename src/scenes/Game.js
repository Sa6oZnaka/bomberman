import {GameMap} from "../api/GameMap.js";
import {FieldEnum} from "../enums/FieldEnum.js";

export class Game extends Phaser.Scene {

    constructor() {
        super({key: "Game"});
    }

    preload() {
        // load assets
    }

    create() {

        this.graphics = this.add.graphics();
        this.gameMap = new GameMap(29, 19);

        for (let i = 0; i < this.gameMap.map.length; i++) {
            for (let j = 0; j < this.gameMap.map[0].length; j++) {
                if (this.gameMap.map[i][j] === FieldEnum.EMPTY)
                    this.graphics.fillStyle(0x009933, 1.0);
                else if (this.gameMap.map[i][j] === FieldEnum.STONE)
                    this.graphics.fillStyle(0x808080, 1.0);
                this.graphics.fillRect(i * 40, j * 40, 40, 40);
            }
        }
    }

    update() {
        // update
    }

}