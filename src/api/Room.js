import {GameMap} from "./GameMap.js";
import {config} from "../config/config.js";
import {User} from "./User.js";

export class Room {

    constructor(name, userLimit){
        this.name = name;
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
        if(this.hasAvailableSlot())
            this.users.set(id, this.createNewUser());
    }

    disconnect(id){
        if(this.users.has(id))
            this.users.delete(id);
    }

    getUsers(){
        return JSON.stringify(Array.from(this.users.entries()));
    }

    getMap(){
        return this.gameMap.map;
    }

}