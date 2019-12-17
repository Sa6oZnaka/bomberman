let replay = require('./replay');

exports = module.exports = function (io, serverRooms) {
    io.sockets.on('connection', function (socket) {
        console.log(`ID ${socket.id} connected!`);

        socket.on('spawn', (roomID) => {
            let room = serverRooms.rooms.get(roomID);
            if (room !== undefined) {
                if (room.users.size > room.required) {
                    socket.emit('spawn', {
                        'map': room.getMap(),
                        'users': room.getUsers(),
                    });
                    socket.to(roomID).emit('newUser', {
                        'id': socket.id,
                        'user': room.getUser(socket.id)
                    });
                } else if (room.users.size === room.required) {
                    io.to(roomID).emit('spawn', {
                        'map': room.getMap(),
                        'users': room.getUsers(),
                    });
                    room.beginRecording();
                    if (!room.joinAfterStart)
                        room.dontAllowJoin = true;
                }
            }
        });

        socket.on('placeBomb', () => {
            let roomID = serverRooms.playerRooms.get(socket.id);
            let room = serverRooms.rooms.get(roomID);
            if (room !== undefined) {
                let user = room.getUser(socket.id);
                if (user === undefined) return;
                let userPos = {
                    x: user.x,
                    y: user.y
                };
                if (room.hasBomb(userPos)) return;
                room.placeBomb(userPos);
                io.to(roomID).emit('placeBomb', userPos);
                setTimeout(() => {
                    explode(roomID, userPos);
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
            if (serverRooms.playerRooms.get(socket.id) !== null)
                markAsDead(serverRooms.playerRooms.get(socket.id), [socket.id]);
        });

        function markAsDead(roomID, deadPlayers) {
            let room = serverRooms.rooms.get(roomID);
            if (room !== null) {
                for (let i = 0; i < deadPlayers.length; i++) {
                    io.to(roomID).emit('disconnectUser', deadPlayers[i]);
                    if (room === undefined) return;
                    room.users.get(deadPlayers[i]).alive = false;
                }
                if (room.getAlive().length <= 1) { // everyone is dead or some won
                    endGame(roomID);
                }
                //console.log("Players: " + room.users.size);
                //console.log("Alive Players: " + room.getAlive().length);
            }
        }

        function endGame(roomID) {
            let room = serverRooms.rooms.get(roomID);
            if (room !== undefined) {
                if (room.getAlive().length === 1) {
                    console.log(JSON.stringify(room.getAlive()[0][0]));
                    io.to(room.getAlive()[0][0]).emit('endGame', "Win");
                    io.to(roomID).emit('endGame', "Lose");
                }
                io.to(roomID).emit('endGame', "Draw");
                if(room.gameRecorder === null) return; // Don't saver if the game was canceled
                replay.save({
                    'replay': room.gameRecorder.export(),
                    'players': room.getUsers()
                });
                serverRooms.removeRoom(roomID);
            }
        }

        function explode(roomID, pos) {
            if (serverRooms.rooms.has(roomID) && serverRooms.rooms.get(roomID).hasBomb(pos)) {
                io.to(roomID).emit('explode', pos);
                let deadPlayers = serverRooms.rooms.get(roomID).detonate(pos).getKilledPlayers();
                if (deadPlayers.length > 0) {
                    markAsDead(roomID, deadPlayers);
                }
            }
        }

    });
};
