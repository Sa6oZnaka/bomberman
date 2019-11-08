import {GameMap} from "./src/api/GameMap.js";
import {User} from "./src/api/User";

let express = require('express');
let app = express();
let http = require('http').createServer(app);
const path = require('path');
let io = require('socket.io')(http);

let gameMap = new GameMap(29, 19);
let users = new Map();

app.use('/src', express.static('src'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', function (socket) {
    console.log(`ID ${socket.id} connected!`);

    socket.on('spawn', function () {
        users.set(socket.id, new User(0, 0, 40));

        let usersJSON = JSON.stringify(Array.from(users.entries()));
        let data = {
            'map': gameMap.map,
            'users' : usersJSON,
            'user' : users.get(socket.id)
        };
        let data2 = {
            'id' : socket.id,
            'user' : users.get(socket.id)
        };

        socket.emit('spawn', data);
        socket.broadcast.emit('newUser', data2);
    });

    socket.on('move', function (pos) {
        let data = {
            'id' : socket.id,
            'pos' : pos
        };
        users.get(socket.id).transit(pos.x, pos.y);
        socket.broadcast.emit('move', data);
    });

    socket.on('disconnect', function () {
        console.log(`ID ${socket.id} disconnected!`);
        users.delete(socket.id);
    });
});

let port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log("listening on port " + port);
});
