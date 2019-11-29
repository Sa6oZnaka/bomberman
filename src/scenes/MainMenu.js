import {RoomEnum} from "../enums/RoomEnum.js";
import {Button} from "../api/menu/Button.js";

export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: "MainMenu"});
        this.text = "";
        this.button = new Button(10, 100, 130, 70);
        this.button2 = new Button(10, 190, 130, 70);
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

        this.add.text(20, 20, 'Button 1 - Casual, Button 2 - Competitive', {
            fill : '#ffffff'
        });
        this.button.draw(this.graphics, pointer);
        this.button2.draw(this.graphics, pointer);

        if(this.button.click(pointer)) {
            this.scene.start("Game", {type: RoomEnum.CASUAL});
        }
        if(this.button2.click(pointer)) {
            this.scene.start("Game", {type: RoomEnum.COMPETITIVE});
        }

    }
}