export class EndGame extends Phaser.Scene {

    constructor() {
        super({key: "EndGame"});
    }

    init(data){
        this.result = data.result;
    }

    preload() {

    }

    create() {
        this.add.text(0, 0, this.result, { fontFamily: '"Roboto Condensed"' });
    }

    update() {

    }
}