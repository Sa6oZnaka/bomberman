import {Room} from "./Room.js";

export class Server {

    constructor(){
        this.rooms = new Map();
    }

    spawn(socket){
        let room;
        let connected = false;
        while (!connected) {
            room = this.getAvailableRoom();
            if (this.rooms.get(room).connect(socket.id)) {
                socket.join(room);
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
        socket.to(room).emit('newUser', data2);
    }

    placeBomb(socket, pos) {
        let room = this.getPlayerRoom(socket.id);
        socket.to(room.id).emit('placeBomb', pos);
        room.data.placeBomb(pos);
        setTimeout(() => {
            this.explode(socket, room.id, pos);
        }, 1000);
    }

    move(socket, pos) {
        let room = this.getPlayerRoom(socket.id);
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

    disconnect (socket) {
        let room = this.getPlayerRoom(socket.id);
        if (room !== undefined) { // after server restart client disconnect
            room.data.leave(socket.id);
            socket.to(room.id).emit("disconnectUser", socket.id);
            socket.leave(room.id);
            console.log(`ID ${socket.id} disconnected!`);
        }
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

    getPlayerRoom(userID) {
        for(let [id, room] of this.rooms){
            if(room.hasUser(userID)){
                return {id:id, data:room}
            }
        }
    }

    explode(socket, room, pos){
        if(this.rooms.get(room).hasBomb(pos)){
            socket.to(room).emit('explode', pos);
            socket.emit('explode', pos);
            this.disconnectUsers(socket, room, this.rooms.get(room).detonate(pos).getKilledPlayers());
        }
    }

    disconnectUsers(socket, room, users){
        for(let i = 0; i < users.length; i ++){
            if(users[i] !== socket.id) {
                socket.to(users[i]).emit('killed');
            }else{
                socket.emit('killed');
            }
        }
    }

}