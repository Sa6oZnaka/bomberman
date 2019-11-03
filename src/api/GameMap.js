import {FieldEnum} from "../enums/FieldEnum.js";

export class GameMap {

    constructor(x, y) {
        this.map = GameMap.init(x, y);
    }

    static init(x, y) {
        let map = [];

        for (let i = 0; i < x; ++i) {
            map[i] = [];
            for (let j = 0; j < y; ++j) {
                if (i === 0 || j === 0 || i === x - 1 || j === y - 1 || (i % 2 === 0 && j % 2 === 0)) {
                    map[i][j] = FieldEnum.STONE;
                } else {
                    if (Math.random() < 0.5) {
                        map[i][j] = FieldEnum.BARRICADE;
                    } else {
                        map[i][j] = FieldEnum.EMPTY;
                    }
                }
            }
        }

        return map;
    }
}