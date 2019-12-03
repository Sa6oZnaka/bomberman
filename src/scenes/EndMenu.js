export class EndMenu extends Phaser.Scene {

    constructor() {
        super({key: "EndMenu"});
    }

    init(data){
        this.result = data.result;
    }

    preload() {

    }

    create() {
        this.add.text(0, 0, this.result, { fontFamily: '"Roboto Condensed"' });
        setTimeout(() => {
            this.scene.start("MainMenu");
        }, 1000);
    }

    update() {

    }
}