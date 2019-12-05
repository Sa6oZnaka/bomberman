import {config} from "./config/config";
import {Server} from "./src/api/Server";

let express = require('express');
let session = require('express-session');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let dbconfig = require('./config/dbconfig');

let passport = require('passport');
let flash = require('connect-flash');
require('./passport')(passport);

app.set('views', __dirname + '/views');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
    secret: 'justasecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('public'));
require('./route')(app, passport);

app.use('/src', express.static('src'));
app.use('/assets', express.static('assets'));


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
