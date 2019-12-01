import {RoomEnum} from "../enums/RoomEnum.js";
import {socket} from "./Game.js";

let room = null;

export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: "MainMenu"});
        this.text = "";
    }

    init(){
        room = null;
    }

    create() {
        this.text = this.add.text(10, 10, '', { fill: '#00ff00' });
        this.graphics = this.add.graphics();

        this.buttonCasual = this.add.sprite(100, 100, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonCasual.setTexture('button', 0);
                this.searchGame(RoomEnum.CASUAL);
            } )
            .on('pointerover', () => this.buttonCasual.setTexture('button', 2) )
            .on('pointerout', () => this.buttonCasual.setTexture('button', 1) );

        this.buttonCompetitive = this.add.sprite(300, 100, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonCompetitive.setTexture('button', 0);
                this.searchGame(RoomEnum.COMPETITIVE);
            } )
            .on('pointerover', () => this.buttonCompetitive.setTexture('button', 2) )
            .on('pointerout', () => this.buttonCompetitive.setTexture('button', 1) );
    }

    update() {
        this.graphics.clear();

        this.add.text(20, 40, 'Button 1 - Casual, Button 2 - Competitive', {
            fill : '#ffffff'
        });

        if(room !== null){
            this.scene.start("Game", {room: room});
        }
    }

    searchGame(type){
        socket.connect().emit('findGame', type);
        this.text.setText([
            'Searching for games...'
        ]);
    }

}

socket.on('foundGame', function (roomID) {
    room = roomID;
});