let mysql = require('mysql'),
    db = 'bomberman',
    dbconfig = require('../../config/databaseConfig');
let connection = mysql.createConnection(dbconfig);
let tables = [ `CREATE TABLE IF NOT EXISTS Users(
    id INT UNSIGNED primary key auto_increment,
    username varchar(50) NOT NULL,
    password varchar(100) NOT NULL,
    wins INT UNSIGNED NOT NULL DEFAULT 0,
    rank_points float UNSIGNED NOT NULL DEFAULT 1,
    level_points float UNSIGNED NOT NULL DEFAULT 0
);`,
`CREATE TABLE IF NOT EXISTS Replays(
    id INT primary key auto_increment,
    jsonData JSON NOT NULL,
    winner varchar(50),
    replay_date datetime NOT NULL
);`,
`CREATE TABLE IF NOT EXISTS User_replay(
    user_id INT NOT NULL,
    replay_id INT NOT NULL,
    PRIMARY KEY(user_id, replay_id)
);`,
`CREATE TABLE IF NOT EXISTS Relationships(
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status char NOT NULL default 'P',
    PRIMARY KEY(sender_id, receiver_id)
);`,
`CREATE TABLE IF NOT EXISTS Messages(
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message varchar(100) NOT NULL,
    seen BOOLEAN,
    PRIMARY KEY(sender_id, receiver_id)
);`];
// 'P' - pending, 'F' - friends, 'B' - blocked

connection.query(`CREATE DATABASE IF NOT EXISTS ?? CHARSET \'utf8\'`, db, function (err) {
    if (err) throw err;
    connection.changeUser({
        database: db
    }, function (err) {
        if (err) throw err;
        for(let i = 0; i < tables.length; i ++){
            connection.query(tables[i], function (err) {
                if (err) throw err;
            });
        }
    });
});

module.exports = connection;