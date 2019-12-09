exports = module.exports = function (io, serverRooms) {
    io.sockets.on('connection', function (socket) {
        console.log(`ID ${socket.id} connected!`);

        socket.on('findGame', (type) => {
            let roomID;
            let connected = false;
            while (!connected) {
                roomID = serverRooms.getBestRoom(type);
                if (serverRooms.rooms.get(roomID).connect(socket.id)) {
                    socket.join(roomID);
                    serverRooms.joinRoom(roomID, socket.id);
                    connected = true;
                }
            }
            let room = serverRooms.rooms.get(roomID);
            if (room.waitForAllPlayers) {
                if (room.users.size === room.userLimit) {
                    socket.emit('foundGame', roomID);
                    for (let [key, data] of room.users) {
                        socket.to(key).emit('foundGame', roomID);
                    }
                    room.dontAllowJoin = true;
                }
            } else {
                socket.emit('foundGame', roomID);
            }
        });
    });
};