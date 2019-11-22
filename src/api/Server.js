import {Room} from "./Room.js";

export class Server {

    constructor(){
        this.rooms = new Map();
        this.playerRooms = new Map();
    }

    spawn(socket){
        let room;
        let connected = false;
        while (!connected) {
            room = this.getAvailableRoom();
            if (this.rooms.get(room).connect(socket.id)) {
                this.playerRooms.set(socket.id, room);
                socket.join(room);
                console.log(room);
                connected = true;
            }
        }
        let data = {
            'map': this.rooms.get(room).getMap(),
            'users': this.rooms.get(room).getUsers(),
        };
        let data2 = {
            'id': socket.id,
            'user': this.rooms.get(room).getUser(socket.id)
        };

        socket.emit('spawn', data);
        socket.to(this.playerRooms.get(socket.id)).emit('newUser', data2);
    }

    getAvailableRoom() {
        for (let [key, room] of this.rooms.entries()) {
            if (room.hasAvailableSlot()) {
                return key;
            }
        }
        let roomID = this.rooms.size;
        this.rooms.set("room" + roomID, new Room(0));
        return "room" + roomID;
    }

    placeBomb(socket, pos) {
        let room = this.playerRooms.get(socket.id);
        socket.to(room).emit('placeBomb', pos);
        this.rooms.get(room).placeBomb(pos);
        setTimeout(() => {
            this.explode(socket, room, pos);
        }, 1000);
    }

    move(socket, pos) {
        let room = this.getPlayerRoom(socket.id);
        if (room.possibleMovement(socket.id, pos)) {
            room.movePlayer(socket.id, pos);
            let data = {
                'id': socket.id,
                'pos': pos
            };
            socket.to(this.playerRooms.get(socket.id)).emit('move', data);
        } else {
            let data = {
                'id': socket.id,
                'pos': room.getLastPosition(socket.id)
            };
            socket.emit('move', data);
        }
    }

    disconnect (socket) {
        let room = this.getPlayerRoom(socket.id);
        if (room !== undefined) { // after server restart client disconnect
            room.leave(socket.id);
            socket.to(this.playerRooms.get(socket.id)).emit("disconnectUser", socket.id);
            socket.leave(this.playerRooms.get(socket.id));
            this.playerRooms.delete(socket.id);
            console.log(`ID ${socket.id} disconnected!`);
        }
    }

    getPlayerRoom(id) {
        return this.rooms.get(this.playerRooms.get(id));
    }

    explode(socket, room, pos){
        if(this.rooms.get(room).hasBomb(pos)){
            socket.to(room).emit('explode', pos);
            socket.emit('explode', pos);
            this.disconnectUsers(room, this.rooms.get(room).detonate(pos).getKilledPlayers());
        }
    }

    disconnectUsers(room, users){
        console.log(users);
    }

}