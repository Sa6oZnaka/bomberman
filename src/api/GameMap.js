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
            let row = [];
            for (let j = 0; j < x; j++) {
                row.push({
                    fieldType: (i === 0 || j === 0 || i === y - 1 || j === x - 1 || (i % 2 === 0 && j % 2 === 0))
                        ? FieldEnum.STONE
                        : (Math.random() < 0.5)
                            ? FieldEnum.BARRICADE
                            : FieldEnum.EMPTY,
                });
            }
            map.push(row);
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
        if (!this.outOfBonds(x, y) && this.map[y][x].fieldType !== FieldEnum.STONE) {
            this.map[y][x].fieldType = FieldEnum.EMPTY;
            let neighbors = GameMap.getNeighbors(x, y);
            for (let i = 0; i < neighbors.length; i++) {
                if (this.map[neighbors[i].y][neighbors[i].x].fieldType === FieldEnum.BARRICADE) {
                    this.map[neighbors[i].y][neighbors[i].x].fieldType = FieldEnum.EMPTY;
                }
            }
        }
    }

    detonate(x, y, scene, r = 5) {
        let detonatedFields = [];
        this.explodeField(x, y, scene);
        for (let i = x; i < x + r; i++) { // iterate forwards for right side
            if (this.map[y][i].fieldType === FieldEnum.BOMB) {
                detonatedFields.push(new Point(i, y, scene));
                detonatedFields.push(...this.detonate(i, y, scene));
            }
            if (this.map[y][i].fieldType === FieldEnum.BARRICADE) {
                detonatedFields.push(new Point(i, y));
                this.explodeField(i, y, scene);
                break;
            }

            if (!this.canContinue(i, y)) {
                break;
            }

            detonatedFields.push(new Point(i, y));
            this.explodeField(i, y, scene);
        }


        for (let i = x; i > x - r; i--) { // iterate backwards for left side
            if (this.map[y][i].fieldType === FieldEnum.BOMB) {
                detonatedFields.push(new Point(i, y));
                detonatedFields.push(...this.detonate(i, y, scene));
            }
            if (this.map[y][i].fieldType === FieldEnum.BARRICADE) {
                detonatedFields.push(new Point(i, y));
                this.explodeField(i, y, scene);
                break;
            }

            if (!this.canContinue(i, y)) {
                break;
            }

            detonatedFields.push(new Point(i, y));
            this.explodeField(i, y, scene);
        }

        for (let j = y; j < y + r; j++) { // iterate downwards for bottom side
            if (this.map[j][x].fieldType === FieldEnum.BOMB) {
                detonatedFields.push(new Point(x, j));
                detonatedFields.push(...this.detonate(x, j, scene));
            }
            if (this.map[j][x].fieldType === FieldEnum.BARRICADE) {
                detonatedFields.push(new Point(x, j));
                this.explodeField(x, j, scene);
                break;
            }

            if (!this.canContinue(x, j)) {
                break;
            }

            detonatedFields.push(new Point(x, j));
            this.explodeField(x, j, scene);
        }

        for (let j = y; j > y - r; j--) { // iterate upwards for top side
            if (this.map[j][x].fieldType === FieldEnum.BOMB) {
                detonatedFields.push(new Point(x, j));
                detonatedFields.push(...this.detonate(x, j, scene));
            }
            if (this.map[j][x].fieldType === FieldEnum.BARRICADE) {
                detonatedFields.push(new Point(x, j));
                this.explodeField(x, j, scene);
                break;
            }

            if (!this.canContinue(x, j)) {
                break;
            }

            detonatedFields.push(new Point(x, j));
            this.explodeField(x, j, scene);
        }

        return detonatedFields;
    }

    explodeField(x, y, scene) {
        this.map[y][x].fieldType = FieldEnum.EXPLOSION;

        setTimeout(() => {
            this.clearExplosion(x, y);
        }, 200);
    }

    hasBomb(x, y){
        return this.map[y][x].fieldType === FieldEnum.BOMB;
    }

    hasExplosion(x, y){
        return this.map[y][x].fieldType === FieldEnum.EXPLOSION;
    }

    canExplode2(x, y) {
        if (this.map[y][x].fieldType === FieldEnum.BARRICADE ||
            this.map[y][x].fieldType === FieldEnum.BOMB ||
            this.map[y][x].fieldType === FieldEnum.EMPTY) {
            return true;
        }

        return false;
    }

    // 1 = detonate, 0 = no, 3 = pass
    canExplode(x, y, detonatedFields) {
        if (this.map[y][x].fieldType === FieldEnum.BOMB) {
        //    this.detonate(x, y);
            return true;
        }
        if (this.map[y][x].fieldType === FieldEnum.STONE)
            return true;
        if (this.map[y][x].fieldType === FieldEnum.BARRICADE) {
            this.explodeField(x, y);
            return true;
        }
        this.explodeField(x, y);
        return false;
    }

    canContinue(x, y) {
        if (this.map[y][x].fieldType === FieldEnum.BOMB) {
            return false;
        }
        if (this.map[y][x].fieldType === FieldEnum.STONE)
            return false;
        if (this.map[y][x].fieldType === FieldEnum.BARRICADE) {
            return false;
        }
        return true;
    }

    clearExplosion(x, y) {
        this.map[y][x].fieldType = FieldEnum.EMPTY;
    }

    placeBomb(x, y, scene) {

        console.log(this.map[y][x]);

        if(this.map[y][x] == 0){
            console.log(y, x);
            console.log("BUGVA");

            this.map[y][x].fieldType = FieldEnum.EMPTY;
        }

        if (!this.outOfBonds(x, y) && this.map[y][x].fieldType !== FieldEnum.BOMB) {
            this.map[y][x].fieldType = FieldEnum.BOMB;

            return true;
        }

        return false;
    }

}