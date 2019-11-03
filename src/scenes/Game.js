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

        this.gameMap.clearForPlayer(1,1);
        this.gameMap.clearForPlayer(27,17);

        for (let i = 0; i < this.gameMap.map.length; i++) {
            for (let j = 0; j < this.gameMap.map[0].length; j++) {
                if (this.gameMap.map[i][j] === FieldEnum.EMPTY)
                    this.graphics.fillStyle(0x009933, 1.0);
                else if (this.gameMap.map[i][j] === FieldEnum.STONE)
                    this.graphics.fillStyle(0x808080, 1.0);
                else
                    this.graphics.fillStyle(0x802b00, 1.0);
                this.graphics.fillRect(j * 40, i * 40, 40, 40);
            }
        }
    }

    update() {
        // update
    }

}