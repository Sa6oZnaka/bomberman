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
        //this.camera = this.cameras.main;

        this.graphics.fillStyle(0x111330, 1.0);
        this.graphics.fillRect(0, 0, this.scale.width, this.scale.height);


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
            let message = this.messages.messages[i].message;

            let messageSizePx = message.length * 11.4;
            let padding = 20;
            let width = messageSizePx + padding;

            let x = offsetX;
            const y = i * sizeY + offsetY;
            const height = sizeY;
            const radius = 15;
            const alpha = 1.0;

            let color = 0x777777;
            if (this.messages.messages[i].sender_id === this.userID) {
                color = 0x008FE2;
                x = this.scale.width - offsetX - width; // Adjust x for right alignment
            }

            this.drawRoundedRect(x, y, width, height, radius, color, alpha);

            let textX = x + padding / 2;
            let textY = y + (height / 2) - (19 / 2); // Assuming a font size of 19px

            this.add.text(textX, textY, message, {
                fontFamily: '"Courier New"', // Monospaced font
                fontSize: '19px'
            });

            // Optionally add the timestamp (uncomment the line below if needed)
            // this.add.text(964, i * sizeY + offsetY, this.messages.messages[i].stamp, { fontFamily: '"Roboto Condensed"' });
        }
        this.camera.setViewport(0, 0, this.scale.width, this.messages.messages.length * sizeY + offsetY);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.camera.y - deltaY < 0 && this.camera.y - deltaY > - (this.messages.messages.length * 55 + 85 - this.scale.height))
                this.camera.y -= deltaY;
        });
    }

}

