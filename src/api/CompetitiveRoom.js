import {Room} from "./Room";
import {GameRecorder} from "./GameRecorder";
import {ActionEnum} from "../enums/ActionEnum";
import {User} from "./User";

export class CompetitiveRoom extends Room {

    constructor(type, gameMap, userLimit, required, joinAfterStart, hasMatchMaking) {
        super(type, gameMap, userLimit, required, joinAfterStart);
        this.gameRecorder = null;
        this.hasMatchMaking = hasMatchMaking;
    }

    beginRecording() {
        if (this.gameRecorder == null)
            this.gameRecorder = new GameRecorder(this.getMap(), this.getUsers())
    }

    placeBomb(point) {
        super.placeBomb(point);
        this.gameRecorder.addAction(ActionEnum.PLACE_BOMB, {point: point});
    }

    movePlayer(id, point) {
        super.movePlayer(id, point);
        this.gameRecorder.addAction(ActionEnum.MOVE, {id: id, point: point});
    }

    markAsDead(id) {
        super.markAsDead(id);
        if (this.gameRecorder !== null)
            this.gameRecorder.addAction(ActionEnum.KILLED, {id: id});
    }

    getAverageRank() {
        let rankPoints = 0;
        for (let [id, user] of this.users.entries()) {
            rankPoints += user.rank;
        }
        return rankPoints / this.users.size;
    }

    createNewUser(username, rank) {
        let pos = this.getNewPlayerPosition();
        this.gameMap.clearForPlayer(pos.x, pos.y);
        return new User(username, pos.x, pos.y, rank);
    }

    connect(id, username, rank) {
        if (this.users.has(id)) {
            return false;
        }
        if (this.canBeJoined()) {
            this.users.set(id, this.createNewUser(username, rank));
            return true
        }
        return false;
    }

}