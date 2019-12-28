import {RoomEnum} from "../enums/RoomEnum.js";
import {socket} from "./Game.js";
import {UserStats} from "../api/UserStats.js";

const http = new XMLHttpRequest();
let room = null;

export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: "MainMenu"});
        this.text = "";
        this.userText = "";
    }

    init(){
        this.username = null;
        this.rank = null;
        room = null;
        this.userStats = null;
    }

    create() {
        this.text = this.add.text(10, 200, '', { fill: '#00ff00' });
        this.userText = this.add.text(10, 10, '', { fill: '#00ff00' });
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x0000FF, 1.0);
        this.graphics.fillRect(0, 660, this.scale.width - 350, this.scale.height);
        this.graphics.fillStyle(0x00FFFF, 1.0);
        this.graphics.fillRect(this.scale.width - 350, 150, this.scale.width, this.scale.height);
        this.graphics.fillStyle(0x000FFF, 1.0);
        this.graphics.fillRect(this.scale.width - 350, 0, this.scale.width, 150);
        this.getUser();

        this.buttonCasual = this.add.sprite(100, 720, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonCasual.setTexture('button', 0);
                this.searchGame(RoomEnum.CASUAL, this.username);
            } )
            .on('pointerover', () => this.buttonCasual.setTexture('button', 2) )
            .on('pointerout', () => this.buttonCasual.setTexture('button', 1) );

        this.buttonCompetitive = this.add.sprite(300, 720, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonCompetitive.setTexture('button', 0);
                this.searchGame(RoomEnum.COMPETITIVE, this.username, this.rank);
            } )
            .on('pointerover', () => this.buttonCompetitive.setTexture('button', 2) )
            .on('pointerout', () => this.buttonCompetitive.setTexture('button', 1) );

        this.buttonReplay = this.add.sprite(700, 720, "button", 1)
            .setInteractive()
            .on('pointerdown', () => {
                this.buttonReplay.setTexture('button', 0);
                this.scene.start("UserReplays", this.username);
            } )
            .on('pointerover', () => this.buttonReplay.setTexture('button', 2) )
            .on('pointerout', () => this.buttonReplay.setTexture('button', 1) );
        this.add.text(50, 710, 'Play Casual', { fontFamily: '"Roboto Condensed"' });
        this.add.text(240, 710, 'Play Competitive', { fontFamily: '"Roboto Condensed"' });
        this.add.text(670, 710, 'Replays', { fontFamily: '"Roboto Condensed"' });
    }

    update() {
        if(room !== null){
            this.scene.start("Game", {room: room});
        }
    }

    searchGame(type, username, rank){
        console.warn(rank);
        if(username === null) return;
        socket.connect().emit('findGame', {
            type: type,
            rank: rank,
            username: username
        });
        this.add.text(20, 20, 'Searching for games...', {
            fill : '#ffffff'
        });
    }

    getUser(){
        http.open('GET', '/getUser', true);
        http.send();
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                let data = JSON.parse(http.responseText);
                console.log(data);
                this.username = data.user;
                this.rank = data.rank;

                this.userStats = new UserStats(data.level, this.rank, data.wins);
                this.add.text(820, 6, 'Username : ' + this.username, { fontFamily: '"Roboto Condensed"' });
                this.add.text(820, 26,  'Wins: ' + data.wins, { fontFamily: '"Roboto Condensed"' });
                this.graphics.fillStyle(0x4f4f4f, 1.0);
                this.graphics.fillRect(820, 50, 300, 20);
                this.graphics.fillStyle(0x0, 1.0);
                this.graphics.fillRect(820, 50, this.userStats.getNextLevelProgress() * 300, 20);
                this.add.text(820, 50, 'Level : ' + this.userStats.getLevel(), { fontFamily: '"Roboto Condensed"' });
                this.add.text(820, 124, 'Rank: ' + this.userStats.getRank(), { fontFamily: '"Roboto Condensed"' });
                this.add.sprite(870, 100, "ranks", this.userStats.getRankId()).setScale(0.5);

            }
        };
    }

}

socket.on('foundGame', function (roomID) {
    room = roomID;
});
