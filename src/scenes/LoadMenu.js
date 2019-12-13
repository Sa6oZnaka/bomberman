export class LoadMenu extends Phaser.Scene{
    constructor(){
        super("loadMenu");
    }
    preload(){
        this.load.spritesheet('button', 'assets/button_sprite_sheet.png', {
            frameWidth: 193,
            frameHeight: 71
        });
    }
    create(){
        this.add.text(20, 20, "Loading...");
        this.scene.start("MainMenu");
    }
}