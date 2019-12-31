export class LoadMenu extends Phaser.Scene{
    constructor(){
        super("loadMenu");
    }
    preload(){
        this.load.spritesheet('button', 'assets/button_sprite_sheet.png', {
            frameWidth: 193,
            frameHeight: 66
        });
        this.load.spritesheet('ranks', 'assets/ranks_sprite_sheet.png', {
            frameWidth: 200,
            frameHeight: 90
        });
        this.load.image('watchButton', 'assets/watch_button.png');
        this.load.image('backButton', 'assets/back_button.png');
    }
    create(){
        this.add.text(20, 20, "Loading...");
        this.scene.start("MainMenu");
    }
}