import {config} from "./src/config/config";
import {Server} from "./src/api/Server";

let express = require('express');
let app = express();
let http = require('http').createServer(app);
const path = require('path');
let io = require('socket.io')(http);

app.use('/src', express.static('src'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

let server = new Server();

io.on('connection', function (socket) {
    console.log(`ID ${socket.id} connected!`);

    socket.on('spawn', function (){
        server.spawn(socket);
    });

    socket.on('placeBomb', function (pos) {
        server.placeBomb(socket, pos);
    });

    socket.on('move', function (pos) {
        server.move(socket, pos);
    });

    socket.on('disconnect', function () {
        server.disconnect(socket);
    });
});

let port = process.env.PORT || config.SERVER_PORT;
http.listen(port, function () {
    console.log("listening on port " + port);
});
