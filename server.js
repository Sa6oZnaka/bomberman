import {GameMap} from "./src/api/GameMap.js";
import {User} from "./src/api/User";
import {Point} from "./src/api/Point";
import {FieldEnum} from "./src/enums/FieldEnum";

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
        users.set(socket.id, new User(1, 1, 40));

        let usersJSON = JSON.stringify(Array.from(users.entries()));
        let data = {
            'map': gameMap.map,
            'users': usersJSON,
        };
        let data2 = {
            'id': socket.id,
            'user': users.get(socket.id)
        };

        socket.emit('spawn', data);
        socket.broadcast.emit('newUser', data2);
    });

    socket.on('placeBomb', function (pos) {
        let data = {
            'pos': pos
        };
        gameMap.placeBomb(pos.x, pos.y);
        socket.broadcast.emit('placeBomb', data);
    });

    socket.on('move', function (pos) {
        let user = users.get(socket.id);
        if (possibleMovement(user, pos)) {
            let data = {
                'id': socket.id,
                'pos': pos
            };
            socket.broadcast.emit('move', data);
            users.get(socket.id).transit(pos.x, pos.y);
        } else {
            let data = {
                'id': socket.id,
                'pos': new Point(user.x, user.y)
            };
            socket.emit('move', data);
        }
    });

    socket.on('disconnect', function () {
        console.log(`ID ${socket.id} disconnected!`);
        users.delete(socket.id);
        socket.broadcast.emit("disconnectUser", socket.id);
    });

    function possibleMovement(user, pos) {
        if (user.inTransit) {
            return false;
        }
        if (Math.abs(pos.x - user.x) + Math.abs(pos.y - user.y) > 1) {
            return false;
        }
        if (gameMap.map[pos.y][pos.x] === FieldEnum.STONE) {
            return false;
        }
        return true;
    }

});

let port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log("listening on port " + port);
});
