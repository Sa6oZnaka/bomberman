import {config} from "./src/config/config";
import {Server} from "./src/api/Server";

let express = require('express');
let app = express();
let http = require('http').createServer(app);
const path = require('path');
let io = require('socket.io')(http);

app.use('/src', express.static('src'));
app.use('/assets', express.static('assets'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

let server = new Server();

io.on('connection', (socket) => {
    console.log(`ID ${socket.id} connected!`);

    socket.on('spawn', (room) => {
        server.spawn(socket, room);
    });

    socket.on('placeBomb', (pos) => {
        server.placeBomb(socket, pos);
    });

    socket.on('move', (pos) => {
        server.move(socket, pos);
    });

    socket.on('disconnect', () => {
        server.disconnect(socket);
    });
    socket.on('findGame', (type) => {
        server.findGame(socket, type);
    });

});

let port = process.env.PORT || config.SERVER_PORT;
http.listen(port, () => {
    console.log("listening on port " + port);
});
