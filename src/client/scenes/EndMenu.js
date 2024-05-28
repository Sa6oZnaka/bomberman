export class EndMenu extends Phaser.Scene {

    constructor() {
        super({ key: "EndMenu" });
    }

    init(data) {
        this.result = data.result;
    }

    preload() {

    }

    create() {
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x111330, 1.0);
        this.graphics.fillRect(0, 0, this.scale.width, this.scale.height);

        this.resultText = this.add.text(100, 480, this.result,
            {
                fontSize: '32px',
                fill: '#FFB946',
                fontFamily: '"Snap ITC"',
                fontStyle: 'bold',
                stroke: '#FE002C',
                strokeThickness: 2
            });

        this.add.sprite(570, 367, 'endgame').setScale(0.7);

        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x111330, 1.0);
        this.graphics.fillRect(0, 0, 300, this.scale.height);
        this.graphics.fillStyle(0x111330, 1.0);
        this.graphics.fillRect(840, 0, this.scale.width, this.scale.height);

        this.textSpeed = 2;
    }

    update() {
        this.resultText.x += this.textSpeed;

        if (this.resultText.x > 800) {
            //this.resultText.x = 200;
            this.scene.start("MainMenu");
        }
    }
}
