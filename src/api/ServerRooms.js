import {RoomFactory} from "../factories/RoomFactory.js";

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

    removeRoom(roomID){
        console.log(this.rooms.get(roomID).gameRecorder.export());
        this.rooms.delete(roomID);
    }

    leave(roomID) {
        this.rooms.delete(roomID);
    }

    getBestRoom(type) {
        let roomID,
            roomPlayers = -1;
        for (let [key, room] of this.rooms.entries()) {
            if (room.type === type && room.canBeJoined()) {
                if (room.users.size > roomPlayers) {
                    roomID = key;
                    roomPlayers = room.users.size;
                }
            }
        }
        if (roomPlayers === -1) {
            roomID = this.createRoom(type);
        }
        return roomID;
    }

}