import {Room} from "../api/Room.js";
import {RoomEnum} from "../enums/RoomEnum.js";
import {GameMap} from "../api/GameMap";
import {gameConfig} from "../../config/gameConfig";

export class RoomFactory {

    static competitive(){
        return new Room(RoomEnum.COMPETITIVE, new GameMap(gameConfig.MAP_SIZE_X, gameConfig.MAP_SIZE_Y), 2, 2, false, true);
    }

    static casual(){
        return new Room(RoomEnum.CASUAL, new GameMap(gameConfig.MAP_SIZE_X, gameConfig.MAP_SIZE_Y), 4, 2, true, false);
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