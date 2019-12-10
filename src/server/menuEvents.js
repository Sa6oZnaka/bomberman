exports = module.exports = function (io, serverRooms) {
    io.sockets.on('connection', function (socket) {
        console.log(`ID ${socket.id} connected!`);

        socket.on('findGame', (data) => {
            if (!serverRooms.playerRooms.has(socket.id))
                findGame(data.type, data.username);
        });

        function findGame(type, username) {
            let roomID = serverRooms.getBestRoom(type);
            if (serverRooms.rooms.get(roomID).connect(socket.id, username)) {
                socket.join(roomID);
                serverRooms.playerRooms.set(socket.id, roomID);
                let room = serverRooms.rooms.get(roomID);
                if (!room.waitForAllPlayers) {
                    socket.emit('foundGame', roomID);
                } else if (room.users.size === room.userLimit) {
                    io.to(roomID).emit('foundGame', roomID);
                }
            } else {
                findGame(type, username);
            }
        }
    });
};