export class User {

    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.inTransit = false;

        this.transitionX = 0;
        this.transitionY = 0;
    }

    transit(x, y) {
        if (this.inTransit) return;
        this.inTransit = true;
        for (let i = 0; i < 10; ++i) {
            setTimeout(() => {
                this.transitionX += Math.round((x - this.x) * this.size / 10);
                this.transitionY += Math.round((y - this.y) * this.size / 10);
            }, 10 * (i + 1));
        }
        setTimeout(() => {
            this.transitionX = 0;
            this.transitionY = 0;

            this.x = x;
            this.y = y;

            this.inTransit = false;
        }, 100);
    }

}