import {GameMap} from "../api/GameMap.js";
import {ActionEnum} from "../enums/ActionEnum.js";
import {User} from "../api/User.js";

export class Replay extends Phaser.Scene {

    constructor() {
        super({key: "Replay"});
    }

    init(data) {
        let replayData = JSON.parse(data);
        this.gameMap = new GameMap();
        this.gameMap.map = replayData.map;
        this.actions = replayData.actions;
        this.startTime = replayData.startTime;
        this.users = new Map();

        let u2 = new Map(JSON.parse(replayData.users));
        for (let [key, value] of u2.entries()) {
            this.users.set(key, new User(value.username, value.x, value.y, 40));
        }
    }

    create() {
        this.graphics = this.add.graphics();
        this.lastActionID = 0;
        this.date = new Date();
        this.timeDiff = this.date.getTime() - this.startTime;
    }

    update() {
        if (this.actions[this.lastActionID].timeStamp + this.timeDiff <= new Date().getTime()) {
            let action = this.actions[this.lastActionID];
            switch (action.type) {
                case ActionEnum.MOVE:
                    this.users.get(action.data.id).transit(action.data.point.x, action.data.point.y);
                    break;
                case ActionEnum.PLACE_BOMB:
                    this.gameMap.placeBomb(action.data.point.x, action.data.point.y);
                    setTimeout(() => {
                        if (this.gameMap.hasBomb(action.data.point.x, action.data.point.y))
                            this.gameMap.detonate(action.data.point.x, action.data.point.y);
                    }, 1000);
                    break;
                default:
                    console.warn("Action not found!");
            }
            if (this.lastActionID < this.actions.length - 1)
                this.lastActionID++;
        }

        this.graphics.clear();
        this.gameMap.draw(this.graphics);

        for (const user of this.users.values()) {
            user.draw(this.graphics);
        }
    }

}
