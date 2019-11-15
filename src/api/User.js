export class User {

    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.inTransit = false;

        this.t1 = 0;
        this.t2 = 0;
    }

    transit(x, y) {
        if (this.inTransit) return;
        let t = this;
        t.inTransit = true;
        for (let i = 0; i < 10; ++i) {
            setTimeout(function() {
                t.t1 += Math.round((x - t.x) * t.size / 10);
                t.t2 += Math.round((y - t.y) * t.size / 10);
            }, 10 * (i + 1));
        }
        setTimeout(function() {
            t.t1 = 0;
            t.t2 = 0;

            t.x = x;
            t.y = y;

            t.inTransit = false;
        }, 100);
    }

    draw(graphics){
        graphics.fillStyle(0x802bFF, 1.0);
        graphics.fillRect(this.x * this.size + this.t1, this.y * this.size + this.t2, 40, 40);
    }

}