import {gameConfig} from "../../config/gameConfig.js";
import {User} from "./User.js";
import {FieldEnum} from "../enums/FieldEnum.js";
import {Point} from "./Point.js";

export class Room {

    constructor(type, gameMap, userLimit, required, joinAfterStart, hasMatchMaking) {
        this.type = type;
        this.gameMap = gameMap;
        this.users = new Map();

        this.joinAfterStart = joinAfterStart;
        this.userLimit = userLimit; // max players that can join
        this.required = required; // required to start a game
        this.dontAllowJoin = false;
        this.hasMatchMaking = hasMatchMaking;
    }

    getUsers() {
        return JSON.stringify(Array.from(this.users.entries()));
    }

    getAlive() {
        const alive = new Map(
            [...this.users]
                .filter(([k, v]) => v.alive)
        );
        return [...alive];
    }

    getUser(id) {
        return this.users.get(id);
    }

    getMap() {
        return this.gameMap.getMap();
    }

    getLastPosition(id) {
        let user = this.users.get(id);
        if (user !== undefined)
            return new Point(user.x, user.y);
    }

    getKilledPlayers() {
        let players = [];
        for (let [id, user] of this.users.entries()) {
            if (this.gameMap.hasExplosion(user.x, user.y)) {
                players.push(id);
            }
        }
        return players;
    }

    placeBomb(point) {
        this.gameMap.placeBomb(point.x, point.y);
    }

    hasBomb(pos) {
        return this.gameMap.hasBomb(pos.x, pos.y);
    }

    detonate(pos) {
        this.gameMap.detonate(pos.x, pos.y);
        return this;
    }

    movePlayer(id, point) {
        this.users.get(id).transit(point.x, point.y);
    }

    canBeJoined() {
        return !this.dontAllowJoin && (this.users.size < this.userLimit || this.userLimit === 0);
    }

    createNewUser(username) {
        let pos = this.getNewPlayerPosition();
        this.gameMap.clearForPlayer(pos.x, pos.y);
        return new User(username, pos.x, pos.y, null);
    }

    getNewPlayerPosition() {
        let minX = 1,
            minY = 1;
        let maxX = gameConfig.MAP_SIZE_X - 2,
            maxY = gameConfig.MAP_SIZE_Y - 2;
        if (this.users.size === 0)
            return new Point(minX, minY);
        if (this.users.size === 1)
            return new Point(maxX, maxY);
        return new Point(
            Math.floor(Math.random() * (maxX - minX) / 2) * 2 + minX,
            Math.floor(Math.random() * (maxY - minY) / 2) * 2 + minY);
    }

    connect(id, username) {
        if (this.users.has(id)) {
            return false;
        }
        if (this.canBeJoined()) {
            this.users.set(id, this.createNewUser(username));
            return true
        }
        return false;
    }

    markAsDead(id) {
        this.users.get(id).alive = false;
    }

    possibleMovement(id, pos) {
        let user = this.users.get(id);
        if (user === undefined) {
            return false;
        }
        if (user.inTransit()) {
            return false;
        }
        if (Math.abs(pos.x - user.x) + Math.abs(pos.y - user.y) > 1) {
            return false;
        }
        if (this.gameMap.map[pos.y][pos.x] !== FieldEnum.EMPTY) {
            return false;
        }
        return true;
    }
}