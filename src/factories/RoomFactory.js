import {Room} from "../api/Room.js";
import {RoomEnum} from "../enums/RoomEnum.js";
import {GameMap} from "../api/GameMap";
import {config} from "../../config/config";

export class RoomFactory {

    static competitive(){
        return new Room(RoomEnum.COMPETITIVE, new GameMap(config.MAP_SIZE_X, config.MAP_SIZE_Y), 2, 2, false);
    }

    static casual(){
        return new Room(RoomEnum.CASUAL, new GameMap(config.MAP_SIZE_X, config.MAP_SIZE_Y), 4, 2, true);
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