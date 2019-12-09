exports = module.exports = function (io, serverRooms) {
    io.sockets.on('connection', function (socket) {
        console.log(`ID ${socket.id} connected!`);

        socket.on('spawn', (roomID) => {
            let room = serverRooms.rooms.get(roomID);
            if (room !== undefined) {
                if (room.waitForAllPlayers) {
                    if (room.users.size === room.userLimit) {
                        socket.emit('spawn', {
                            'map': room.getMap(),
                            'users': room.getUsers(),
                        });
                        for (let [key, data] of room.users) {
                            socket.to(key).emit('spawn', {
                                'map': room.getMap(),
                                'users': room.getUsers(),
                            });
                        }
                        room.dontAllowJoin = true;
                    }
                } else {
                    socket.emit('spawn', {
                        'map': room.getMap(),
                        'users': room.getUsers(),
                    });
                    socket.to(roomID).emit('newUser', {
                        'id': socket.id,
                        'user': room.getUser(socket.id)
                    });
                }
            }
        });

        socket.on('placeBomb', (pos) => {
            let roomID = serverRooms.playerRooms.get(socket.id);
            let room = serverRooms.rooms.get(roomID);
            if (room !== undefined) {
                room.placeBomb(pos);
                socket.to(roomID).emit('placeBomb', pos);
                setTimeout(() => {
                    explode(roomID, pos);
                }, 1000);
            }
        });

        socket.on('move', (pos) => {
            let roomID = serverRooms.playerRooms.get(socket.id);
            let room = serverRooms.rooms.get(roomID);
            if (room === undefined) return;
            if (room.possibleMovement(socket.id, pos)) {
                room.movePlayer(socket.id, pos);
                socket.to(roomID).emit('move', {
                    'id': socket.id,
                    'pos': pos
                })
            } else {
                socket.emit('move', {
                    'id': socket.id,
                    'pos': room.getLastPosition(socket.id)
                });
            }
        });

        socket.on('disconnect', () => {
            let roomID = serverRooms.playerRooms.get(socket.id);
            if (roomID === undefined) return;
            let room = serverRooms.rooms.get(roomID);
            room.leave(socket.id);
            if (room.users.size === 0) {
                serverRooms.rooms.delete(roomID);
            }
            if (room.users.size === 1) {
                disconnectUsers(socket, roomID, [room.users.keys().next().value], "Win");
            }
            serverRooms.playerRooms.delete(socket.id);
            socket.to(roomID).emit("disconnectUser", socket.id);
            socket.leave(roomID);
            console.log(`ID ${socket.id} disconnected!`);
        });

        function checkUsers(socket, roomID, deadUsers) {
            let room = serverRooms.rooms.get(roomID);
            if (room.users.size === deadUsers.length) {
                disconnectUsers(socket, roomID, deadUsers, "Draw");
            } else {
                disconnectUsers(socket, roomID, deadUsers, "Lose");
            }
        }

        function disconnectUsers(socket, roomID, users, result) {
            for (let i = 0; i < users.length; i++) {
                if (socket.id !== users[i]) {
                    socket.to(users[i]).emit('endGame', result);
                } else {
                    socket.emit('endGame', result);
                }
                if (serverRooms.rooms.get(roomID) !== undefined)
                    serverRooms.rooms.get(roomID).leave(users[i]);
            }
        }

        function explode(roomID, pos) {
            if (serverRooms.rooms.has(roomID) && serverRooms.rooms.get(roomID).hasBomb(pos)) {
                io.to(roomID).emit('explode', pos);
                let deadPlayers = serverRooms.rooms.get(roomID).detonate(pos).getKilledPlayers();
                if (deadPlayers.length > 0) {
                    checkUsers(socket, roomID, deadPlayers);
                }
            }
        }

    });
};
