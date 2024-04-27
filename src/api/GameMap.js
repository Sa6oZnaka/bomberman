import {FieldEnum} from "../enums/FieldEnum.js";
import {Point} from "./Point.js";

export class GameMap {

    constructor(x, y) {
        this.map = GameMap.init(x, y);
        //this.game = null;
    }

    static init(x, y) {
        let map = [];
        for (let i = 0; i < y; i++) {
            map[i] = [];
            for (let j = 0; j < x; j++) {
                if (i === 0 || j === 0 || i === y - 1 || j === x - 1 || (i % 2 === 0 && j % 2 === 0)) {
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

    getMap(){
        let map = [];
        for (let i = 0; i < this.map.length; i++) {
            map[i] = [];
            for (let j = 0; j < this.map[0].length; j++) {
                map[i][j] = this.map[i][j];
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

    detonate(x, y, scene, r = 5) {
        let detonatedFields = [];
        this.explodeField(x, y, scene);
        for (let i = 1; i < r + 1; i++) {
            if(this.canExplode2(x + i, y))
                detonatedFields.push(new Point(x + i, y));

            if (this.canExplode(x + i, y,))
                break;
        }
        for (let i = 1; i < r + 1; i++) {
            if(this.canExplode2(x - i, y))
                detonatedFields.push(new Point(x - i, y));

            if (this.canExplode(x - i, y))
                break;
        }
        for (let i = 1; i < r + 1; i++) {
            if(this.canExplode2(x, y - i))
                detonatedFields.push(new Point(x, y - i));

            if (this.canExplode(x, y - i))
                break;
        }
        for (let i = 1; i < r + 1; i++) {
            if(this.canExplode2(x, y + i))
                detonatedFields.push(new Point(x, y + i));

            if (this.canExplode(x, y + i))
                break;
        }

        return detonatedFields;
    }

    explodeField(x, y, scene) {
        this.map[y][x] = FieldEnum.EXPLOSION;

        setTimeout(() => {
            this.clearExplosion(x, y);
        }, 200);
    }

    hasBomb(x, y){
        return this.map[y][x] === FieldEnum.BOMB;
    }

    hasExplosion(x, y){
        return this.map[y][x] === FieldEnum.EXPLOSION;
    }

    canExplode2(x, y) {
        if (this.map[y][x] === FieldEnum.BARRICADE ||
            this.map[y][x] === FieldEnum.BOMB ||
            this.map[y][x] === FieldEnum.EMPTY) {
            return true;
        }

        return false;
    }

    // 1 = detonate, 0 = no, 3 = pass
    canExplode(x, y, detonatedFields) {
        if (this.map[y][x] === FieldEnum.BOMB) {
            this.detonate(x, y);
            return true;
        }
        if (this.map[y][x] === FieldEnum.STONE)
            return true;
        if (this.map[y][x] === FieldEnum.BARRICADE) {
            this.explodeField(x, y);
            return true;
        }
        this.explodeField(x, y);
        return false;
    }

    clearExplosion(x, y) {
        this.map[y][x] = FieldEnum.EMPTY;
    }

    placeBomb(x, y, scene) {
        if (!this.outOfBonds(x, y) && this.map[y][x] !== FieldEnum.BOMB) {
            this.map[y][x] = FieldEnum.BOMB;

            return true;
        }

        return false;
    }

}