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
        this.camera = this.cameras.main;
        this.add.sprite(40, 20, 'backButton')
            .setInteractive()
            .on('pointerdown', (pointer) => {
                this.scene.start("MainMenu");
            })
    }

    drawMenu(replays) {
        this.add.text(80, 18, this.username + "'s replays:", {fontFamily: '"Roboto Condensed"'});
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
            this.add.sprite(980, i * 55 + 85, 'watchButton')
                .setInteractive()
                .on('pointerdown', (pointer) => {
                    this.startReplay(replays[i].jsonData);
                })
        }
        this.camera.setViewport(0, 0, this.scale.width, replays.length * 55 + 85);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.camera.y - deltaY < 0 && this.camera.y - deltaY > -(replays.length * 55 + 85 - this.scale.height))
                this.camera.y -= deltaY;
        });
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

    startReplay(replayData) {
        this.scene.start("Replay", replayData);
    }
}

