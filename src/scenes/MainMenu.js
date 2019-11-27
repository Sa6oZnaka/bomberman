export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: "MainMenu"});
        this.text = "";
    }

    preload() {

    }

    create() {
        this.text = this.add.text(10, 10, '', { fill: '#00ff00' });
        this.graphics = this.add.graphics();
    }

    update() {
        this.graphics.clear();

        let pointer = this.input.activePointer;
        this.text.setText([
            'x: ' + pointer.worldX,
            'y: ' + pointer.worldY,
            'isDown: ' + pointer.isDown,
            'rightButtonDown: ' + pointer.rightButtonDown()
        ]);

        if(pointer.x > 10 && pointer.x < 140 && pointer.y > 100 && pointer.y < 170){
            if(pointer.leftButtonDown()) {
                this.scene.start("Game");
            }
            this.graphics.fillStyle(0xFF0000, 1.0);
        }else{
            this.graphics.fillStyle(0x802bFF, 1.0);
        }
        this.graphics.fillRect(10, 100, 130, 70);
        this.add.text(10, 100, "PLAY", { fontFamily: '"Roboto Condensed"' });
    }
}