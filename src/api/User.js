import {gameConfig} from "../../config/gameConfig.js";

export class User {

    constructor(username, x, y, rank) {
        this.username = username;
        this.rank = rank;
        this.x = x;
        this.y = y;
        this.size = gameConfig.GRID_CELL_SIZE;
        this.inTransit = false;
        this.alive = true;
        this.transitionX = 0;
        this.transitionY = 0;
    }

    transit(x, y) {
        if (this.inTransit) return;
        this.inTransit = true;
        for (let i = 0; i < 10; ++i) {
            setTimeout(() => {
                this.transitionX += Math.round((x - this.x) * this.size / 10);
                this.transitionY += Math.round((y - this.y) * this.size / 10);
            }, 10 * (i + 1));
        }
        setTimeout(() => {
            this.transitionX = 0;
            this.transitionY = 0;
            this.x = x;
            this.y = y;

            this.inTransit = false;
        }, 100);
    }


    drawOtherUser(graphics) {
        graphics.fillStyle(0xff6600, 1.0);
        graphics.fillRect(this.x * this.size + this.transitionX, this.y * this.size + this.transitionY, 40, 40);
    }

}