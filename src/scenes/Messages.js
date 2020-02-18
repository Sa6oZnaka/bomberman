import {UserMessages} from "../api/UserMessages.js";

const http = new XMLHttpRequest();

export class Messages extends Phaser.Scene {

    constructor() {
        super({key: "Messages"});
    }

    init(username) {
        this.getMessages(username);
        this.username = username;
    }

    create() {
        this.graphics = this.add.graphics();

        this.add.sprite(40, 20, 'backButton')
            .setInteractive()
            .on('pointerdown', (pointer) => {
                this.sendMessage(prompt("Message"));
            });
    }

   sendMessage(message){
        http.open('POST', '/sendMessage', true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        http.send("data=" + JSON.stringify({
            username: this.username,
            message: message
       }));
    }

    getMessages(username) {
        $.ajax({
            url: "/getMessages",
            type: "get", //send it through get method
            data: {
                name: username
            },
            success:(response) => {
                this.messages = new UserMessages(JSON.parse(response));
                this.showMessages();
            },
            error: function(xhr) {
                console.warn(xhr);
            }
        });
    }

    showMessages(){
        console.log(this.messages.messages);
        let messages = this.messages.messages;
        for(let i = 0; i < messages.length; i ++){
            // TODO Select color by sender
            // if () ......
            this.graphics.fillStyle(0x000080, 1.0);
            this.graphics.fillRect(100, i * 40, 200, 39);
            this.add.text(100, i * 40, messages[i].message, {fontFamily: '"Roboto Condensed"'});
        }
    }

}

