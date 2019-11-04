let express = require('express');
let app = express();
let http = require('http').createServer(app);
const path = require('path');
let io = require('socket.io')(http);

app.use('/src', express.static('src'));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

io.on('connection', function (socket) {
    console.log(`ID ${socket.id} connected!`);

    socket.on('disconnect', function () {
        console.log(`ID ${socket.id} disconnected!`);
    });
});

http.listen(3000, function(){
    console.log("listening on port 3000...");
});
