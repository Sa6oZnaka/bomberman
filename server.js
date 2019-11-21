import {config} from "./src/config/config";
import {Room} from "./src/api/Room";

let express = require('express');
let app = express();
let http = require('http').createServer(app);
const path = require('path');
let io = require('socket.io')(http);

let rooms = new Map();
let playerRooms = new Map();

app.use('/src', express.static('src'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', function (socket) {
    console.log(`ID ${socket.id} connected!`);

    socket.on('spawn', function () {

        let room;
        let connected = false;
        while (!connected) {
            room = getAvailableRoom();
            if (rooms.get(room).connect(socket.id)) {
                playerRooms.set(socket.id, room);
                socket.join(room);
                connected = true;
            }
        }

        let data = {
            'map': rooms.get(room).getMap(),
            'users': rooms.get(room).getUsers(),
        };
        let data2 = {
            'id': socket.id,
            'user': rooms.get(room).getUser(socket.id)
        };

        socket.emit('spawn', data);
        socket.to(playerRooms.get(socket.id)).emit('newUser', data2);
    });

    socket.on('placeBomb', function (pos) {
        let data = {
            'pos': pos
        };
        getPlayerRoom(socket.id).placeBomb(pos);
        socket.to(playerRooms.get(socket.id)).emit('placeBomb', data);
    });

    socket.on('move', function (pos) {
        let room = getPlayerRoom(socket.id);
        if (room.possibleMovement(socket.id, pos)) {
            room.movePlayer(socket.id, pos);
            let data = {
                'id': socket.id,
                'pos': pos
            };
            socket.to(playerRooms.get(socket.id)).emit('move', data);
        } else {
            let data = {
                'id': socket.id,
                'pos': room.getLastPosition(socket.id)
            };
            socket.emit('move', data);
        }
    });

    socket.on('disconnect', function () {
        let room = getPlayerRoom(socket.id);
        if (room !== undefined) { // after server restart client disconnect
            room.leave(socket.id);
            socket.to(playerRooms.get(socket.id)).emit("disconnectUser", socket.id);
            socket.leave(playerRooms.get(socket.id));
            playerRooms.delete(socket.id);
            console.log(`ID ${socket.id} disconnected!`);
        }
    });

    function getPlayerRoom(id) {
        return rooms.get(playerRooms.get(id));
    }

    function getAvailableRoom() {
        for (let [key, room] of rooms.entries()) {
            if (room.hasAvailableSlot()) {
                return key;
            }
        }
        let roomID = rooms.size;
        rooms.set("room" + roomID, new Room(2));
        return "room" + roomID;
    }
});

let port = process.env.PORT || config.SERVER_PORT;
http.listen(port, function () {
    console.log("listening on port " + port);
});
