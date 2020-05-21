import {RoomEnum} from "../../enums/RoomEnum.js";
import {UserStats} from "../../api/UserStats.js";

export let socket = io();
const http = new XMLHttpRequest();
let room = null;

export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: "MainMenu"});
        this.text = "";
    }

    init() {
        this.username = null;
        this.rank = null;
        room = null;
    }

    create() {
        socket.emit('sendMessage', "fewfwe");

        this.seperatorX = this.scale.width - 350;
        this.seperatorY1 = 150;
        this.seperatorY2 = 680;

        this.getUser();
        this.text = this.add.text(10, 200, '', {fill: '#00ff00'});
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0xD9514E, 1.0);
        this.graphics.fillRect(0, this.seperatorY2, this.seperatorX, this.scale.height);
        this.graphics.fillStyle(0x2A2B2D, 1.0);
        this.graphics.fillRect(this.seperatorX, this.seperatorY1, this.scale.width, this.scale.height);
        this.graphics.fillStyle(0x2DA8D8, 1.0);
        this.graphics.fillRect(this.seperatorX, 0, this.scale.width, 150);
        this.addButton(100, this.seperatorY2 + 40, () => { // Casual button
            this.searchGame(RoomEnum.CASUAL, this.username);
        });
        this.addButton(300, this.seperatorY2 + 40, () => { // Competitive button
            this.searchGame(RoomEnum.COMPETITIVE, this.username, this.rank);
        });
        this.addButton(this.seperatorX - 100, this.seperatorY2 + 40, () => { // Replays button
            this.scene.start("UserReplays", this.username);
        });
        this.addButton(this.seperatorX + 100, this.seperatorY2 + 40, () => { // Add friend button
            http.open('POST', '/addFriend', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(prompt("Friend's username")));
            //this.getFriends();
        });
        this.add.text(50, this.seperatorY2 + 30, 'Play Casual', {fontFamily: '"Roboto Condensed"'});
        this.add.text(240, this.seperatorY2 + 30, 'Play Competitive', {fontFamily: '"Roboto Condensed"'});
        this.add.text(this.seperatorX - 130, this.seperatorY2 + 30, 'Replays', {fontFamily: '"Roboto Condensed"'});
        this.add.text(this.seperatorX + 60, this.seperatorY2 + 30, 'Add friend', {fontFamily: '"Roboto Condensed"'});

        this.add.text(this.seperatorX + 10, this.seperatorY1, 'Friend List', {fontFamily: '"Roboto Condensed"'});
        this.add.text(12 , this.seperatorY1 - 20, 'Leaderboard', {fontFamily: '"Roboto Condensed"'});

        this.add.text(12 , 35, 'Bomberman', {fontFamily: '"Roboto Condensed"', fontSize: 80});
    }

    addButton(x, y, onClick) {
        this.add.sprite(x, y, "button", 1)
            .setInteractive()
            .on('pointerdown', function () {
                this.setTexture('button', 0);
                onClick();
            })
            .on('pointerover', function () {
                this.setTexture('button', 2)
            })
            .on('pointerout', function () {
                this.setTexture('button', 1)
            });
    }

    addSmallButton(x, y, id, onClick) {
        this.add.sprite(x, y, "smallButton", 0 + id * 3)
            .setInteractive()
            .on('pointerdown', function () {
                this.setTexture('smallButton', 2 + id * 3);
                onClick();
            })
            .on('pointerover', function () {
                this.setTexture('smallButton', 1 + id * 3)
            })
            .on('pointerout', function () {
                this.setTexture('smallButton', 0 + id * 3)
            });
    }


    update() {
        if (room !== null) {
            this.scene.start("Game", {room: room});
        }
    }

    searchGame(type, username, rank) {
        if (username === null) return;
        socket.connect().emit('findGame', {
            type: type,
            rank: rank,
            username: username
        });
        this.add.text(20, 20, 'Searching for games...', {
            fill: '#ffffff'
        });
    }

    getUser() {
        http.open('GET', '/getUser', true);
        http.send();
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                let data = JSON.parse(http.responseText);
                //console.log(data);
                this.username = data.user;
                this.rank = data.rank;

                let margin = 10;
                this.userStats = new UserStats(data.level, this.rank, data.wins);
                this.add.text(this.seperatorX + margin, 6, 'Username : ' + this.username, {fontFamily: '"Roboto Condensed"'});
                this.add.text(this.seperatorX + margin, 26, 'Wins: ' + data.wins, {fontFamily: '"Roboto Condensed"'});
                this.graphics.fillStyle(0x2A2B2D, 1.0);
                this.graphics.fillRect(this.seperatorX + margin, 50, this.scale.width - this.seperatorX - margin * 2, 20);
                this.graphics.fillStyle(0xD9514E, 1.0);
                this.graphics.fillRect(this.seperatorX + margin, 50, this.userStats.getNextLevelProgress() * (this.scale.width - this.seperatorX - margin * 2), 20);
                this.add.text(this.seperatorX + margin, 50, 'Level : ' + this.userStats.getLevel(), {fontFamily: '"Roboto Condensed"'});
                this.add.sprite(this.seperatorX + margin + 50, 100, "ranks", this.userStats.getRankId()).setScale(0.5);
                this.add.text(this.seperatorX + margin, 124, 'Rank: ' + this.userStats.getRank(), {fontFamily: '"Roboto Condensed"'});
                this.getLeaderBoard();
            }
        };
    }

    getLeaderBoard() {
        http.open('GET', '/getLeaderBoard', true);
        http.send();
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                let data = JSON.parse(http.responseText);
                //console.log(data);
                let gap = 12;
                let sizeY = (this.seperatorY2 - gap - this.seperatorY1) / 10;

                for (let i = 0; i < data.length; i++) {
                    if (data[i].username === this.username)
                        this.graphics.fillStyle(0xD9514E, 1.0);
                    else
                        this.graphics.fillStyle(0x2A2B2D, 1.0);
                    this.graphics.fillRect(gap, 151 + i * sizeY, this.seperatorX - gap * 2, sizeY - 2);
                    this.add.text(18, 174 + i * sizeY, '#' + (i + 1), {fontFamily: '"Roboto Condensed"'});
                    this.add.text(50, 174 + i * sizeY, 'Username : ' + data[i].username, {fontFamily: '"Roboto Condensed"'});
                    this.add.text(this.seperatorX - 170, 174 + i * sizeY, 'Rank : ', {fontFamily: '"Roboto Condensed"'});
                    this.add.sprite(this.seperatorX - 65, 174 + i * sizeY, "ranks", UserStats.getRankByPoints(data[i].rank_points)).setScale(0.5);
                }
                this.getFriends();
            }
        }
    }

    getFriends() {
        http.open('GET', '/getFriends', true);
        http.send();
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                let data = JSON.parse(http.responseText);
                for (let i = 0; i < data.length; i++) {
                    this.removeRelationButton(this.scale.width - 24, this.seperatorY1 + 35 + 30 * i, data[i].username);
                    if (data[i].status === 'P') {
                        this.removeRelationButton(this.scale.width - 24 - 28, this.seperatorY1 + 35 + 30 * i, data[i].username);
                        this.addAcceptButton(this.scale.width - 24 - 28*2, this.seperatorY1 + 35 + 30 * i, data[i]);
                        this.blockUser(this.scale.width - 24 - 28, this.seperatorY1 + 35 + 30 * i, data[i].username);
                        this.graphics.fillStyle(0xFFFF00, 1.0);
                    } else if (data[i].status === 'F') {
                        this.addSmallButton(this.scale.width - 24 - 28*2, this.seperatorY1 + 35 + 30 * i, 3,  () => {
                            this.scene.start("Messages", data[i].username);
                        });
                        this.removeRelationButton(this.scale.width - 24 - 28, this.seperatorY1 + 35 + 30 * i, data[i].username);
                        this.blockUser(this.scale.width - 24 - 28, this.seperatorY1 + 35 + 30 * i, data[i].username);
                        this.graphics.fillStyle(0x008000, 1.0);
                    }
                    else if (data[i].status === 'B') {
                        this.graphics.fillStyle(0x800000, 1.0);
                    }
                    this.graphics.fillRect(this.seperatorX + 10, this.seperatorY1 + 20 + 30 * i, this.scale.width - this.seperatorX - 20, 29);

                    this.add.text(this.seperatorX + 20, 175 + i * 30, data[i].username, {fontFamily: '"Roboto Condensed"'});

                    console.log(data[i].username);
                }

            }
        }
    }

    addAcceptButton(x, y, data){
        this.addSmallButton(x, y, 0, function () {
            http.open('POST', '/acceptFriend', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(data.username));
        });
    }
    removeRelationButton(x, y, username){
        this.addSmallButton(x, y, 1, function () {
            http.open('POST', '/removeFriend', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(username));
        });
    }
    blockUser(x, y, username){
        this.addSmallButton(x, y, 2, function () {
            http.open('POST', '/blockUser', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(username));
        });
    }
}

socket.on('foundGame', function (roomID) {
    room = roomID;
});
