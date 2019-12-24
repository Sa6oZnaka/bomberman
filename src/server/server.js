import {config} from "../../config/config";
import {ServerRooms} from "../api/ServerRooms";

let express = require('express')
    , session = require('express-session')
    , app = express()
    , http = require('http').Server(app)
    , path = require('path')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , io = require('socket.io')(http)
    , passport = require('passport')
    , flash = require('connect-flash')
    , connection = require('./dbInit');

app.set('view engine', 'ejs')
    .use(cookieParser())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(session({
        secret: 'justasecret',
        resave: true,
        saveUninitialized: true
    }))
    .use('/src', express.static('src'))
    .use('/assets', express.static('assets'))
    .use(passport.initialize())
    .use(passport.session())
    .use(flash())
    .use(express.static('public'));

let serverRooms = new ServerRooms();
require('./passport')(passport, connection);
require('./gameEvents')(io, serverRooms, connection);
require('./route')(app, passport, connection);

let port = process.env.PORT || config.SERVER_PORT;
http.listen(port, () => {
    console.log("listening on port " + port);
});
