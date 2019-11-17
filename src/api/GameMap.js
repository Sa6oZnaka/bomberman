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
        console.error(this.map[0].length, this.map.length - 1);
        return (x < 0 || y < 0 || x > this.map[0].length - 1 || y > this.map.length - 1);
    }

    clearForPlayer(x, y) {
        if (!this.outOfBonds(x, y) && this.map[y][x] !== FieldEnum.STONE) {
            this.map[y][x] = FieldEnum.EMPTY;
            let neighbors = GameMap.getNeighbors(x, y);
            for (let i = 0; i < neighbors.length; i++) {
                if (this.map[neighbors[i].y][neighbors[i].x] === FieldEnum.BARRICADE) {
                    this.map[neighbors[i].y][neighbors[i].x] = FieldEnum.EMPTY;
                }
            }
        }
    }

    detonate(x, y, r = 5) {
        this.explodeField(x, y);
        for (let i = 1; i < r + 1; i ++) {
            if(this.explode(x + i, y)) break;
        }
        for (let i = 1; i < r + 1; i ++) {
            if(this.explode(x - i, y)) break;
        }
        for (let i = 1; i < r + 1; i ++) {
            if(this.explode(x, y - i)) break;
        }
        for (let i = 1; i < r + 1; i ++) {
            if(this.explode(x, y + i)) break;
        }
    }

    explodeField(x, y){
        this.map[y][x] = FieldEnum.EXPLOSION;
        let t = this;
        setTimeout(function () {
            t.clearExplosion(x, y);
        }, 200);
    }

    explode(x, y){
        if (this.map[y][x] === FieldEnum.BOMB) {
            this.detonate(x, y);
            return true;
        }
        if (this.map[y][x] === FieldEnum.STONE)
            return true;
        if (this.map[y][x] === FieldEnum.BARRICADE){
            this.explodeField(x, y);
            return true;
        }
        this.explodeField(x, y);
        return false;
    }

    clearExplosion(x, y){
        this.map[y][x] = FieldEnum.EMPTY;
    }

    placeBomb(x, y) {
        if (!this.outOfBonds(x, y) && this.map[y][x] !== FieldEnum.BOMB) {
            let t = this;
            this.map[y][x] = FieldEnum.BOMB;
            setTimeout(function () {
                if(t.map[y][x] === FieldEnum.BOMB)
                    t.detonate(x, y);
            }, 1000);
        }
    }
}