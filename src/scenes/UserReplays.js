const http = new XMLHttpRequest();

export class UserReplays extends Phaser.Scene {

    constructor() {
        super({key: "UserReplays"});
    }

    init(data) {
        this.username = data;
        this.getUserReplays();
        this.replays = [];
    }

    create() {
        this.graphics = this.add.graphics();
    }

    drawMenu(replays) {
        this.add.text(80, 18, this.username + "'s replays:", {fontFamily: '"Roboto Condensed"'});
        console.log(replays);
        for (let i = 0; i < replays.length; i++) {
            let rect = new Phaser.Geom.Rectangle(80, i * 55 + 60, this.scale.width - 2 * 80, 50);
            this.add.text(80, i * 55 + 78, replays[i].replay_date.slice(0, 19).replace('T', ' '), {fontFamily: '"Roboto Condensed"'});
            if (replays[i].winner === this.username)
                this.graphics.fillStyle(0x008000, 1.0);
            else if (replays[i].winner === null)
                this.graphics.fillStyle(0xFFFF00, 1.0);
            else
                this.graphics.fillStyle(0xFF0000, 1.0);
            this.graphics.fillRectShape(rect);
            this.add.sprite(980, i * 55 + 60 + 25, 'watchButton')
                .setInteractive()
                .on('pointerdown',  (pointer) => {
                    this.startReplay(replays[i].jsonData);
                })
                .on('pointerout', function (pointer) {
                    this.clearTint();
                })
                .on('pointerup', function (pointer) {
                    this.setTint(0xff0000);
                });
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

    startReplay(replayData){
        this.scene.start("Replay", replayData);
    }
}

