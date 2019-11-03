import {FieldEnum} from "../enums/FieldEnum.js";
import {Point} from "./Point.js";

export class GameMap {

    constructor(x, y) {
        this.map = GameMap.init(x, y);
    }

    static init(x, y) {
        let map = [];

        for (let i = 0; i < y; i++) {
            map[i] = [];
            for (let j = 0; j < x; j++) {
                if (i === 0 || j === 0 || i === y - 1 || j === x - 1 || (i % 2 === 0 && j % 2 === 0)) {
                    map[i][j] = FieldEnum.STONE;
                } else {
                    if (Math.random() < 0.7) {
                        map[i][j] = FieldEnum.BARRICADE;
                    } else {
                        map[i][j] = FieldEnum.EMPTY;
                    }
                }
            }
        }

        return map;
    }

    static getNeighbors(x, y) {
        return [new Point(x - 1, y), new Point(x + 1, y), new Point(x, y - 1), new Point(x, y + 1)];
    }
    
    outOfBonds(x, y) {
        return (x < 0 || y < 0 || x > this.map[0].length - 1 || y > this.map.length - 1);
    }

    clearForPlayer(x, y) {
        if(! this.outOfBonds(x, y) && this.map[y][x] !== FieldEnum.STONE) {
            this.map[y][x] = FieldEnum.EMPTY;
            let neighbors = GameMap.getNeighbors(x, y);
            for (let i = 0; i < neighbors.length; i++) {
                if (this.map[neighbors[i].y][neighbors[i].x] === FieldEnum.BARRICADE) {
                    this.map[neighbors[i].y][neighbors[i].x] = FieldEnum.EMPTY;
                }
            }
        }
    }
}