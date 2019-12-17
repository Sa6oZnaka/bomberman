import {RoomEnum} from "../enums/RoomEnum.js";
import {socket} from "./Game.js";
import {replayData} from "../../assets/replay.js";

const http = new XMLHttpRequest();
let room = null;
let username = null;

export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: "MainMenu"});
        this.text = "";
        this.userText = "";
    }

    init(){
        room = null;
    }

    create() {
        this.text = this.add.text(10, 200, '', { fill: '#00ff00' });
        this.userText = this.add.text(10, 10, '', { fill: '#00ff00' });
        this.graphics = this.add.graphics();

        this.add.text(20, 40, 'Button 1 - Casual, Button 2 - Competitive', {
            fill : '#ffffff'
        });
        this.add.text(20, 240, 'Button 3 - Replay', {
            fill : '#ffffff'
        });

        this.getUser();

        this.buttonCasual = this.add.sprite(100, 100, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonCasual.setTexture('button', 0);
                this.searchGame(RoomEnum.CASUAL, username);
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

        this.buttonReplay = this.add.sprite(100, 300, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonReplay.setTexture('button', 0);
                this.scene.start("Replay", replayData);
            } )
            .on('pointerover', () => this.buttonReplay.setTexture('button', 2) )
            .on('pointerout', () => this.buttonReplay.setTexture('button', 1) );

    }

    update() {
        if(room !== null){
            this.scene.start("Game", {room: room});
        }
        this.userText.setText([
            'Username: ' + username
        ]);
    }

    searchGame(type, username){
        socket.connect().emit('findGame', {
            type: type,
            username: username
        });
        this.text.setText([
            'Searching for games...'
        ]);
    }

    getUser(){
        http.open('GET', '/getUser', true);
        http.send();

        http.onreadystatechange = processRequest;

        let response;
        function processRequest(e) {
            if (http.readyState === 4 && http.status === 200) {
                response = JSON.parse(http.responseText);
                username = response;
            }
        }
    }
}

socket.on('foundGame', function (roomID) {
    room = roomID;
});
