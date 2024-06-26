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
        this.seperatorX = this.scale.width - 300;
        this.seperatorY1 = 150;
        this.seperatorY2 = 680;

        this.add.sprite(431, 400, 'leaderboard');
        this.add.sprite(1009, 382, 'side');

        this.getUser();
        this.text = this.add.text(10, 200, '', {fill: '#00ff00'});
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x1B1464, 1.0);
        this.graphics.fillRect(0, this.seperatorY2, this.seperatorX, this.scale.height);

        this.graphics.fillStyle(0x111330, 1.0);
        this.graphics.fillRect(0, 0, this.scale.width, this.scale.height);

        let size = 215;

        this.add.sprite(570, 67, 'header');
        this.add.sprite(570, 209, 'logo');
        this.add.sprite(260 + size * 3, 500, 'menu2');

        this.add.sprite(260, 500, 'menu2');

        this.add.text(180, 319, 'Leaderboard', {
            fontFamily: '"Snap ITC"',
            color: '#EAAE33',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.add.text(180 + size * 3, 319, 'Friends', {
            fontFamily: '"Snap ITC"',
            color: '#EAAE33',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.add.sprite(260 + size * 2, 482, 'competitive');
        this.add.sprite(260 + size, 482, 'casual');

        this.addButton(260 + size * 2, this.seperatorY2 - 33, () => { // Casual button
            this.searchGame(RoomEnum.COMPETITIVE, this.username, this.rank);
        });
        this.addButton(260 + size, this.seperatorY2 - 33, () => { // Competitive button
            this.searchGame(RoomEnum.CASUAL, this.username);
        });

        this.addRefreshButton(650, 490, () => { // Replays button
            this.scene.start("UserReplays", this.username);
        });

        this.add.text(181 + size * 2, this.seperatorY2 - 45, 'Play Competitive', {
            fontFamily: '"Snap ITC"',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.add.text(205 + size, this.seperatorY2 - 45, 'Play Casual', {
            fontFamily: '"Snap ITC"',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.addAddButton(980, 330, () => { // Add friend button
            http.open('POST', '/addFriend', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(prompt("Friend's username")));
        });


        this.graphics = this.add.graphics();
        this.getUser();
    }

    addButton(x, y, onClick) {
        this.add.sprite(x, y, "button1", 1)
            .setInteractive()
            .on('pointerdown', function () {
                this.setTexture('button1', 0);
                onClick();
            })
            .on('pointerover', function () {
                this.setTexture('button1', 0)
            })
            .on('pointerout', function () {
                this.setTexture('button1', 1)
            });
    }

    addSmallButton(x, y, id, onClick) {
        this.add.sprite(x, y, "smallButton", 0 + id * 3)
            .setScale(0.66)
            .setInteractive()
            .on('pointerdown', function () {
                this.setTexture('smallButton', 2 + id * 3).setScale(0.66);
                onClick();
            })
            .on('pointerover', function () {
                this.setTexture('smallButton', 1 + id * 3).setScale(0.66);
            })
            .on('pointerout', function () {
                this.setTexture('smallButton', 0 + id * 3).setScale(0.66);
            });
    }

    addAddButton(x, y, onClick) {
        this.add.sprite(x, y, "button2", 1)
            .setScale(0.3)
            .setInteractive()
            .on('pointerdown', function () {
                this.setTexture('button2', 0);
                onClick();
            })
            .on('pointerover', function () {
                this.setTexture('button2', 0)
            })
            .on('pointerout', function () {
                this.setTexture('button2', 1)
            });
    }

    addRefreshButton(x, y, onClick) {
        this.add.sprite(x, y, "button3", 1)
            .setScale(0.3)
            .setInteractive()
            .on('pointerdown', function () {
                this.setTexture('button3', 0);
                onClick();
            })
            .on('pointerover', function () {
                this.setTexture('button3', 0)
            })
            .on('pointerout', function () {
                this.setTexture('button3', 1)
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

                let margin = 17;
                this.userStats = new UserStats(data.level, this.rank, data.wins);
                this.add.text(770, 115, 'Username : ' + this.username, {
                    fontFamily: '"Roboto Condensed"',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                });
                this.add.sprite(737, 490, 'cup');
                this.add.text(750, 480, data.wins, {
                    fontFamily: '"Roboto Condensed"',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 2
                });

                let userLevelProgress = this.userStats.getNextLevelProgress();

                const x = 154;
                const y = 720;
                const maxWidth = this.scale.width - x * 2;
                const width = userLevelProgress * maxWidth;
                const height = 20;
                const radius = 10;
                const alpha = 1.0;

                this.drawRoundedRect(x - 2, y - 2, maxWidth + 4, height + 4, radius, 0x008FE2, alpha);
                this.drawRoundedRect(x, y, maxWidth, height, radius, 0x002C46, alpha);
                if(userLevelProgress > 0.02) {
                    this.drawRoundedRect(x, y, width, height, radius, 0xFD0142, alpha);
                }

                this.add.text(maxWidth / 2 + x - 20, y,
                    'Level : ' + (this.userStats.getLevel() + 1),
                    {
                        fontFamily: '"Roboto Condensed"',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 2
                    });


                this.add.sprite(694, 460, "ranks", this.userStats.getRankId()).setScale(0.5);


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
                let gap = 10;
                let sizeY = 34;

                for (let i = 0; i < data.length; i++) {
                    if(i > 10)
                        break;

                    let color = 0x2A2B2D;
                    let alpha = 0.5;

                    if (data[i].username === this.username) {
                        color = 0xEAAE33;
                        alpha = 1.0;
                    }

                    const x = 164;
                    const y = 347 + i * sizeY;
                    const width = 190;
                    const height = sizeY - 4;
                    const radius = 10;

                    this.drawRoundedRect(x, y, width, height, radius, color, alpha);

                    //this.add.text(18, 174 + i * sizeY, '#' + (i + 1), {fontFamily: '"Roboto Condensed"'});
                    this.add.text(178, 352 + i * sizeY, (i + 1) + ". " + data[i].username, {
                        fontFamily: '"Roboto Condensed"',
                        stroke: '#000000',
                        strokeThickness: 2
                    });
                    //this.add.text(this.seperatorX - 170, 174 + i * sizeY, 'Rank : ', {fontFamily: '"Roboto Condensed"'});
                    //this.add.sprite(this.seperatorX - 65, 174 + i * sizeY, "ranks", UserStats.getRankByPoints(data[i].rank_points)).setScale(0.5);
                }
                this.getFriends();
            }
        }
    }

    getFriends() {
        http.open('GET', '/getFriends', true);
        http.send();
        http.onreadystatechange = () => {

            let sizeY = 34;

            if (http.readyState === 4 && http.status === 200) {
                let data = JSON.parse(http.responseText);
                for (let i = 0; i < data.length; i++) {
                    let color = "#ffffff";

                    let backgroundColor = 0xFF0033;

                    //this.removeFriendButton(this.scale.width - 24, this.seperatorY1 + 35 + 30 * i, data[i].username);
                    if (data[i].status === 'P') {
                        // this.scale.width = canvas.width
                        this.removeFriendButton(1000 - 20, 362 + sizeY * i, data[i].username);
                        this.addAcceptButton(1000 - 20*2, 362 + sizeY * i, data[i]);
                        //this.blockUser(this.scale.width - 24 - 15, this.seperatorY1 + 35 + 30 * i, data[i].username);
                        backgroundColor = 0xEAAE33;
                    } else if (data[i].status === 'F') {
                        this.addSmallButton(1000 - 20*2, 362 + sizeY * i, 3,  () => {
                            this.scene.start("Messages", data[i].username);
                        });
                        this.removeFriendButton(1000 - 20, 362 + sizeY * i, data[i].username);
                        //this.blockUser(1000 - 20, 360 + 30 * i, data[i].username);
                        //this.playWithUser(1000 - 20 * 3, 362 + sizeY * i, data[i].username);
                        backgroundColor = 0x008000;

                        //color = "#08ff00";
                    }
                    //else if (data[i].status === 'B') {
                    //    this.graphics.fillStyle(0x800000, 1.0);
                    //}

                    const x = 810;
                    const y = 347 + i * sizeY;
                    const width = 190;
                    const height = sizeY - 4;
                    const radius = 10;
                    const alpha = 1.0;

                    this.drawRoundedRect(x, y, width, height, radius, backgroundColor, alpha, 0x000000, 2);


                    this.add.text(820, 352 + i * sizeY, data[i].username, {
                        fontFamily: '"Roboto Condensed"',
                        stroke: '#000000',
                        strokeThickness: 2, color: color
                    });

                    //console.log(data[i].username);
                }

            }
        }
    }

    drawRoundedRect(x, y, width, height, radius, fillColor, fillAlpha, strokeColor, strokeThickness) {
        this.graphics.lineStyle(strokeThickness, strokeColor); // Outline color is black
        this.graphics.fillStyle(fillColor, fillAlpha); // Set the fill color and transparency
        this.graphics.beginPath();
        this.graphics.moveTo(x + radius, y);
        this.graphics.lineTo(x + width - radius, y);
        this.graphics.arc(x + width - radius, y + radius, radius, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(360));
        this.graphics.lineTo(x + width, y + height - radius);
        this.graphics.arc(x + width - radius, y + height - radius, radius, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(90));
        this.graphics.lineTo(x + radius, y + height);
        this.graphics.arc(x + radius, y + height - radius, radius, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(180));
        this.graphics.lineTo(x, y + radius);
        this.graphics.arc(x + radius, y + radius, radius, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270));
        this.graphics.closePath();
        this.graphics.fillPath();
        this.graphics.strokePath(); // Draw the outline
    }


    addAcceptButton(x, y, data){

        console.log(data);

        this.addSmallButton(x, y, 0, function () {
            http.open('POST', '/acceptFriend', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(data.username));
        });
    }
    removeFriendButton(x, y, username){
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
    playWithUser(x, y, username){
        this.addSmallButton(x, y, 4, function () {
            http.open('POST', '/playWithUser', true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.send("data=" + JSON.stringify(username));
        });
    }
}

socket.on('foundGame', function (roomID) {
    room = roomID;
});
