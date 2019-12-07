import {Server} from "../api/Server";
let server = new Server();

exports = module.exports = function(io){
    io.sockets.on('connection', function (socket) {
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
};