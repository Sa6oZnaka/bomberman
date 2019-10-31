export class Game extends Phaser.Scene {

    constructor(){
        super({key: "Game"});
    }

    preload(){
        // load assets
    }

    create(){
        // create

        let graphics = this.add.graphics();

        graphics.fillStyle(0xFFFFFF, 1.0);
        graphics.fillRect(50, 50, 200-50, 200-50);

        graphics.fillStyle(0xFFFF00, 1.0);
        graphics.fillRect(200, 200, 100, 100);

    }

    update(){
        // update
    }

}