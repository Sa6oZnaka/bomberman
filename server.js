import {GameMap} from "./src/api/GameMap.js";

let express = require('express');
let app = express();
let http = require('http').createServer(app);
const path = require('path');
let io = require('socket.io')(http);

let gameMap = new GameMap(29, 19);

app.use('/src', express.static('src'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', function (socket) {
    console.log(`ID ${socket.id} connected!`);

    socket.on('spawn', function () {
        let data = {
            'map': gameMap.map
        };
        socket.emit('spawn', data);
    });

    socket.on('disconnect', function () {
        console.log(`ID ${socket.id} disconnected!`);
    });
});

let port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log("listening on port " + port);
});
