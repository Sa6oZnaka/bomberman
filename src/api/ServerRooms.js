import {RoomFactory} from "../factories/RoomFactory.js";
import {gameConfig} from "../../config/gameConfig.js";
import {RoomEnum} from "../enums/RoomEnum";

export class ServerRooms {

    constructor() {
        this.rooms = new Map();
        this.playerRooms = new Map();
        this.lastRoomID = 0;
    }

    disconnect(userID) {
        let roomID = this.playerRooms.get(userID);
        if (this.rooms.has(roomID)) {
            this.rooms.get(roomID).disconnect(userID);
        }
    }

    createRoom(type) {
        this.rooms.set(++this.lastRoomID, RoomFactory.getByType(type));
        return this.lastRoomID;
    }

    removeRoom(roomID) {
        this.rooms.delete(roomID);
    }

    leave(roomID) {
        this.rooms.delete(roomID);
    }

    getBestRoom(type, rank) {
        let roomID,
            roomPlayers = -1,
            roomRank = gameConfig.MAX_RANK_POINTS_GAP + 1;
        for (let [key, room] of this.rooms.entries()) {
            if (room.type === type && room.canBeJoined()) {
                if (room.users.size > roomPlayers) {
                    let rankGap = Math.abs(room.getAverageRank() - rank);
                    if (!room.hasMatchMaking || rankGap <= gameConfig.MAX_RANK_POINTS_GAP && roomRank > rankGap) {
                        roomID = key;
                        roomPlayers = room.users.size;
                        roomRank = rankGap;
                    }
                }
            }
        }
        if (roomPlayers === -1) {
            roomID = this.createRoom(type);
        }
        return roomID;
    }

}