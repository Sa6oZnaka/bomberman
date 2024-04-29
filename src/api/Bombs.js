import {Bomb} from "./Bomb.js";

export class Bombs {

    constructor() {
        this.bombs = [];
    }

    addBomb(x, y, sprite){
        this.bombs.push(new Bomb(x, y, sprite));
    }

    removeBomb(x, y) {
        for (let i = 0; i < this.bombs.length; i++) {
            if (this.bombs[i].x === x && this.bombs[i].y === y) {
                this.bombs[i].sprite.destroy();
                this.bombs.splice(i, 1);
                break;
            }
        }
    }

    removeBombs(points) {
        for(let i = 0; i < points.length; i ++){
            this.removeBomb(points[i].x, points[i].y);
        }
    }
}