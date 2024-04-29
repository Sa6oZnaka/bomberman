export class Load extends Phaser.Scene{
    constructor(){
        super("loadMenu");
    }
    preload(){
        this.load.spritesheet('button', 'assets/button_sprite_sheet.png', {
            frameWidth: 193,
            frameHeight: 66
        });
        this.load.spritesheet('smallButton', 'assets/small_button_sprite_sheet.png', {
            frameWidth: 28,
            frameHeight: 28
        });
        this.load.spritesheet('ranks', 'assets/ranks_sprite_sheet.png', {
            frameWidth: 200,
            frameHeight: 90
        });
        this.load.image('watchButton', 'assets/watch_button.png');
        this.load.image('backButton', 'assets/back_button.png');
        this.load.image('newButton', 'assets/new_message_button.png');
        this.load.image('refreshButton', 'assets/refresh_button.png');

        this.load.image('stone', 'assets/stone01.png');
        this.load.image('grass', 'assets/grass01.png');
        this.load.image('ice', 'assets/ice.png');
        this.load.spritesheet('bomb', 'assets/bomb.png', {
            frameWidth: 80,
            frameHeight: 80
        });

        this.load.spritesheet('explode', 'assets/explode.png', {
            frameWidth: 125,
            frameHeight: 125
        });

        this.load.image('player1', 'assets/player1.png');
        this.load.spritesheet('player0', 'assets/player0.png', {
            frameWidth: 125,
            frameHeight: 125
        });
    }
    create(){
        this.add.text(20, 20, "Loading...");
        this.scene.start("MainMenu");
    }
}