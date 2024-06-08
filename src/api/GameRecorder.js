import {Action} from "./Action";

export class GameRecorder {

    constructor(map, users){
        console.log("--");
        console.log(map);

        this.map = this.extractOldMap(map);
        this.users = users;

        this.date = new Date();
        this.startTime = this.date.getTime();
        this.actions = [];
    }

    addAction(type, data){
        this.actions.push(new Action(type, data, new Date().getTime()));
    }

    extractOldMap(map) {
        const oldMap = [];
        for (let i = 0; i < map.length; i++) {
            const row = [];
            for (let j = 0; j < map[i].length; j++) {
                row.push(map[i][j].fieldType);
            }
            oldMap.push(row);
        }
        return oldMap;
    }

    toJSON() {
        // Define the properties that should be serialized
        return {
            map: this.map,
            users: this.users,
            date: this.date,
            startTime: this.startTime,
            actions: this.actions
        };
    }

    export(){
        return JSON.stringify(this.toJSON());
    }
}