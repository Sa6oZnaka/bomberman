export class Button {

    constructor(x, y, sizeX, sizeY){
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    outOfBounds(pointer){
        return !(this.x < pointer.x && pointer.x < this.x + this.sizeX && this.y < pointer.y && pointer.y < this.y + this.sizeY);
    }

    click(pointer){
        return (!this.outOfBounds(pointer) && pointer.leftButtonDown());
    }

    draw(graphics, pointer){
        if(! this.outOfBounds(pointer)) {
            graphics.fillStyle(0x802bFF, 1.0);
        }else {
            graphics.fillStyle(0xFF2bFF, 1.0);
        }
        graphics.fillRect(this.x, this.y, this.sizeX, this.sizeY);
    }

}