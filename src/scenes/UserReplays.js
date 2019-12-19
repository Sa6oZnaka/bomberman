const http = new XMLHttpRequest();

export class UserReplays extends Phaser.Scene {

    constructor() {
        super({key: "UserReplays"});
    }

    init(data) {
        this.username = data;
        this.getUserReplays();
    }

    create() {
        this.graphics = this.add.graphics();
    }

    drawMenu(replays) {
        console.log(replays);
        for (let i = 0; i < replays.length; i++) {
            this.add.text(80, i * 55 + 18, replays[i].replay_date, {fontFamily: '"Roboto Condensed"'});
            if (replays[i].winner === this.username)
                this.graphics.fillStyle(0x00FF00, 1.0);
            else if (replays[i].winner === "NULL")
                this.graphics.fillStyle(0xFFFF00, 1.0);
            else
                this.graphics.fillStyle(0xFF0000, 1.0);

            this.graphics.fillRect(80, i * 55, this.scale.width - 160, 50);
        }
    }

    update() {

    }

    getUserReplays() {
        http.open('GET', '/getUserReplays', true);
        http.send();
        http.onreadystatechange = processRequest;
        let t = this;

        function processRequest(e) {
            if (http.readyState === 4 && http.status === 200) {
                t.drawMenu(JSON.parse(http.responseText));
            }
        }
    }
}

