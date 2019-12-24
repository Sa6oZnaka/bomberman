let mysql = require('mysql'),
    db = 'bomberman',
    dbconfig = require('../../config/dbconfig');
let connection = mysql.createConnection(dbconfig);
let userTable = (`Create table if not exists Users(
    id INT primary key auto_increment,
    username varchar(50) NOT NULL,
    password varchar(100) NOT NULL
);`);
let replaysTable = (`Create table if not exists Replays(
    id INT primary key auto_increment,
    jsonData JSON NOT NULL,
    winner varchar(50),
    replay_date date NOT NULL
);`);
let userReplaysTable = (`Create table if not exists User_replay(
    user_id INT NOT NULL,
    replay_id INT NOT NULL,
    PRIMARY KEY(user_id, replay_id)
);`);

connection.query(`CREATE DATABASE IF NOT EXISTS ?? CHARSET \'utf8\'`, db, function (err) {
    if (err) throw err;
    connection.changeUser({
        database: db
    }, function (err) {
        if (err) throw err;
        connection.query(userTable, function (err) {
            if (err) throw err;
        });
        connection.query(replaysTable, function (err) {
            if (err) throw err;
        });
        connection.query(userReplaysTable, function (err) {
            if (err) throw err;
        });
    });
});

module.exports = connection;