import {Room} from "./Room.js";

export class Server {

    constructor() {
        this.rooms = new Map();
        this.userRoom = new Map();
        this.lastRoomId = 0;
    }

    spawn(socket) {
        let roomID;
        let connected = false;
        while (!connected) {
            roomID = this.getBestRoom();
            if (this.rooms.get(roomID).connect(socket.id)) {
                socket.join(roomID);
                this.userRoom.set(socket.id, roomID);
                connected = true;
            }
        }
        let room = this.rooms.get(roomID);
        if(room.waitForAllPlayers) {
            if (room.users.size === room.userLimit) {
                socket.emit('spawn', {
                    'map': this.rooms.get(roomID).getMap(),
                    'users': this.rooms.get(roomID).getUsers(),
                });
                for(let [key, data] of room.users){
                    socket.to(key).emit('spawn', {
                        'map': this.rooms.get(roomID).getMap(),
                        'users': this.rooms.get(roomID).getUsers(),
                    });
                }
                room.dontAllowJoin = true;
            }
        }else {
            socket.emit('spawn', {
                'map': this.rooms.get(roomID).getMap(),
                'users': this.rooms.get(roomID).getUsers(),
            });
            socket.to(roomID).emit('newUser', {
                'id': socket.id,
                'user': this.rooms.get(roomID).getUser(socket.id)
            });
        }
    }

    placeBomb(socket, pos) {
        let room = this.getPlayerRoom(socket.id);
        if (room.data !== undefined) {
            room.data.placeBomb(pos);
            socket.to(room.id).emit('placeBomb', pos);
            setTimeout(() => {
                this.explode(socket, room.id, pos);
            }, 1000);
        }
    }

    move(socket, pos) {
        let room = this.getPlayerRoom(socket.id);
        if (room.data !== undefined) {
            if (room.data.possibleMovement(socket.id, pos)) {
                room.data.movePlayer(socket.id, pos);
                let data = {
                    'id': socket.id,
                    'pos': pos
                };
                socket.to(room.id).emit('move', data);
            } else {
                let data = {
                    'id': socket.id,
                    'pos': room.data.getLastPosition(socket.id)
                };
                socket.emit('move', data);
            }
        }
    }

    disconnect(socket) {
        let room = this.getPlayerRoom(socket.id);
        if (room !== undefined) {
            if (room.data !== undefined) {
                room.data.leave(socket.id);
                if (room.data.users.size === 0) {
                    this.rooms.delete(room.id);
                }
                if (room.data.users.size === 1) {
                    this.disconnectUsers(socket, room.id, [room.data.users.keys().next().value], "Win");
                }
            }
            socket.to(room.id).emit("disconnectUser", socket.id);
            socket.leave(room.id);
            console.log(`ID ${socket.id} disconnected!`);
        }
    }

    getBestRoom() {
        let roomID,
            roomPlayers = -1;
        for (let [key, room] of this.rooms.entries()) {
            if (room.hasAvailableSlot() && ! room.dontAllowJoin) {
                if (room.users.size > roomPlayers) {
                    roomID = key;
                    roomPlayers = room.users.size;
                }
            }
        }
        if (roomPlayers === -1) {
            roomID = this.createRoom();
        }
        return roomID;
    }

    createRoom() {
        let roomID = this.lastRoomId;
        this.lastRoomId++;
        this.rooms.set("room" + roomID, new Room(2, true));
        return "room" + roomID;
    }

    getPlayerRoom(userID) {
        let roomID = this.userRoom.get(userID);
        return {id: roomID, data: this.rooms.get(roomID)}
    }

    explode(socket, roomID, pos) {
        if (this.rooms.has(roomID) && this.rooms.get(roomID).hasBomb(pos)) {
            socket.to(roomID).emit('explode', pos);
            socket.emit('explode', pos);
            let deadPlayers = this.rooms.get(roomID).detonate(pos).getKilledPlayers();
            if (deadPlayers.length > 0) {
                this.checkUsers(socket, roomID, deadPlayers);
            }
        }
    }

    checkUsers(socket, roomID, deadUsers) {
        let room = this.rooms.get(roomID);
        let playersInRoom = room.users.size;
        if (playersInRoom === deadUsers.length) {
            this.disconnectUsers(socket, roomID, deadUsers, "Draw");
        } else {
            this.disconnectUsers(socket, roomID, deadUsers, "Lose");
        }
    }

    disconnectUsers(socket, roomID, users, result) {
        for (let i = 0; i < users.length; i++) {
            if (socket.id !== users[i]) {
                socket.to(roomID).emit('endGame', result);
            } else {
                socket.emit('endGame', result);
            }
            this.rooms.get(roomID).leave(users[i]);
        }
    }

}