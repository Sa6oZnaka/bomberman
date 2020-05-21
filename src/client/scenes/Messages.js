import {UserMessages} from "../../api/UserMessages.js";

const http = new XMLHttpRequest();

export class Messages extends Phaser.Scene {

    constructor() {
        super({key: "Messages"});
    }

    init(username) {
        this.getUserID(username);
        this.username = username;
    }

    create() {
        this.graphics = this.add.graphics();
        this.camera = this.cameras.main;

        this.add.sprite(40, 20, 'backButton')
            .setInteractive()
            .on('pointerdown', (pointer) => {
                this.scene.start("MainMenu");
            });
        this.add.sprite(1040, 20, 'newButton')
            .setInteractive()
            .on('pointerdown', (pointer) => {
                this.sendMessage(prompt("Message"));
            });
        this.add.sprite(1120, 20, 'refreshButton')
            .setInteractive()
            .on('pointerdown', (pointer) => {
                this.getMessages(this.username)
            });
    }

    getUserID(username){
        $.ajax({
            url: "/getUserID",
            type: "get", //send it through get method
            success: (response) => {
                this.userID = (JSON.parse(response)[0].id);
                this.getMessages(username); // get messages for user
            },
            error: function (xhr) {
                console.warn(xhr);
            }
        });
    }

    sendMessage(message) {
        if (message.length === 0) return;
        http.open('POST', '/sendMessage', true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        http.send("data=" + JSON.stringify({
            username: this.username,
            message: message
        }));
        this.getMessages(this.username);
    }

    getMessages(username) {
        $.ajax({
            url: "/getMessages",
            type: "get", //send it through get method
            data: {
                name: username
            },
            success: (response) => {
                this.messages = new UserMessages(JSON.parse(response));
                console.log(this.messages);

                this.showMessages();
            },
            error: function (xhr) {
                console.warn(xhr);
            }
        });
    }

    showMessages() {
        const offsetY = 50;
        const offsetX = 10;
        const sizeX = this.scale.width - 2 * offsetX;
        const sizeY = 40;
        for (let i = 0; i < this.messages.messages.length; i++) {
            if (this.messages.messages[i].sender_id === this.userID) {
                this.graphics.fillStyle(0x0078ff, 1.0);
            } else {
                this.graphics.fillStyle(0x777777, 1.0);
            }
            this.graphics.fillRect(offsetX, i * sizeY + offsetY, sizeX, sizeY-1);
            this.add.text(offsetX, i * sizeY + offsetY, this.messages.messages[i].message, {fontFamily: '"Roboto Condensed"'});

            this.add.text(964, i * sizeY + offsetY, this.messages.messages[i].stamp, {fontFamily: '"Roboto Condensed"'});
        }
        this.camera.setViewport(0, 0, this.scale.width, this.messages.messages.length * sizeY + offsetY);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.camera.y - deltaY < 0 && this.camera.y - deltaY > - (this.messages.messages.length * 55 + 85 - this.scale.height))
                this.camera.y -= deltaY;
        });
    }

}

