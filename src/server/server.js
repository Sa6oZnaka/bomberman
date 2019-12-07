import {config} from "../../config/config";

let express = require('express')
    , session = require('express-session')
    , app = express()
    , http = require('http').Server(app)
    , path = require('path')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , io = require('socket.io')(http)
    , passport = require('passport')
    , flash = require('connect-flash');

require('./passport')(passport);
require('./gameEvents')(io);
require('./route')(app, passport);

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

app.use('/src', express.static('src'));
app.use('/assets', express.static('assets'));

let port = process.env.PORT || config.SERVER_PORT;
http.listen(port, () => {
    console.log("listening on port " + port);
});
