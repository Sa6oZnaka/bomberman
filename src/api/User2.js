import {gameConfig} from "../../config/gameConfig.js";

export class User2 {

    constructor(username, hero, x, y) {
        this.username = username;

        // TODO: Not in use
        this.x = x;
        this.y = y;

        this.size = gameConfig.GRID_CELL_SIZE;
        this.inTransit = false;
        this.alive = true;
        this.transitionX = 0;
        this.transitionY = 0;

        this.hero = hero;
        //this.hero.x = x;
        //this.hero.y = y;
    }

    transit(x, y, tw) {
        if (this.inTransit) return;
        this.inTransit = true;

        const totalTime = 50; // Adjust for desired speed (milliseconds)

        let textureIndex = 0;

        if(x * this.size + this.size / 2 > this.hero.x){ // right
            textureIndex = 12;
        }
        if(x * this.size + this.size / 2 < this.hero.x){ // left
            textureIndex = 4;
        }
        if(y * this.size + this.size / 2 > this.hero.y){ // down
            textureIndex = 8;
        }
        if(y * this.size + this.size / 2 < this.hero.y){ // up
            textureIndex = 0;
        }

        this.hero.setTexture("player0", textureIndex).setScale(0.33);

        let step = 0;
        let totalSteps = 70;
        let tIndex = 0;

        tw.add({
            targets: this.hero,
            x: x * this.size + this.size / 2,
            y: y * this.size + this.size / 2,
            duration: totalTime,
            ease: 'Linear',
            onUpdate: () => {
                step++;
                tIndex = Math.min(Math.floor(step / (totalSteps / 4)), 3); // Limit tIndex to 3 (max of 4 textures)

                this.hero.setTexture("player0", textureIndex + tIndex).setScale(0.33);
                //console.log(textureIndex + tIndex);
            },
            onComplete: () => {
                this.inTransit = false;
            }
        });
    }
}