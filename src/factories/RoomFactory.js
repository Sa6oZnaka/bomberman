import {Room} from "../api/Room.js";
import {RoomEnum} from "../enums/RoomEnum.js";

export class RoomFactory {

    static competitive(){
        return new Room(RoomEnum.COMPETITIVE, 2, true);
    }

    static casual(){
        return new Room(RoomEnum.CASUAL, 8, false);
    }

    static getByType(type){
        if(type === RoomEnum.CASUAL){
            return this.casual();
        }
        if(type === RoomEnum.COMPETITIVE){
            return this.competitive();
        }
    }

}