import {GameMap} from "./GameMap.js";
import {config} from "../config/config.js";
import {User} from "./User.js";
import {FieldEnum} from "../enums/FieldEnum";
import {Point} from "./Point";

export class Room {

    constructor(userLimit){
        this.userLimit = userLimit;

        this.gameMap = new GameMap(config.MAP_SIZE_X, config.MAP_SIZE_Y);
        this.users = new Map();
    }

    placeBomb(point){
        this.gameMap.placeBomb(point.x, point.y);
    }

    movePlayer(id, point){
        this.users.get(id).transit(point.x, point.y);
    }

    hasAvailableSlot(){
        return this.users.size < this.userLimit;
    }

    createNewUser(){
        return new User(1, 1, config.GRID_CELL_SIZE);
    }

    connect(id){
        if(this.hasAvailableSlot()) {
            this.users.set(id, this.createNewUser());
            return true
        }
        return false;
    }

    leave(id){
        if(this.users.has(id))
            this.users.delete(id);
    }

    getUsers(){
        return JSON.stringify(Array.from(this.users.entries()));
    }

    getUser(id){
        return this.users.get(id);
    }

    getMap(){
        return this.gameMap.map;
    }

    getLastPosition(id){
        let user = this.users.get(id);
        return new Point(user.x, user.y);
    }

    possibleMovement(id, pos) {
        let user = this.users.get(id);
        if (user.inTransit) {
            return false;
        }
        if (Math.abs(pos.x - user.x) + Math.abs(pos.y - user.y) > 1) {
            return false;
        }
        if (this.gameMap.map[pos.y][pos.x] === FieldEnum.STONE) {
            return false;
        }
        return true;
    }

}