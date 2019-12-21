import {Action} from "./Action";

export class GameRecorder {

    constructor(map, users){
        this.map = map;
        this.users = users;

        this.date = new Date();
        this.startTime = this.date.getTime();
        this.actions = [];
    }

    addAction(type, data){
        this.actions.push(new Action(type, data, new Date().getTime()));
    }

    export(){
        return JSON.stringify(this);
    }

}