let mysql = require('mysql'),
    db = 'bomberman',
    dbconfig = require('../../config/databaseConfig');
let connection = mysql.createConnection(dbconfig);
let tables = [ `CREATE TABLE IF NOT EXISTS User(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    wins INT UNSIGNED NOT NULL DEFAULT 0,
    rank_points FLOAT UNSIGNED NOT NULL DEFAULT 1,
    level_points FLOAT UNSIGNED NOT NULL DEFAULT 0
);`,
`CREATE TABLE IF NOT EXISTS Replay(
    id INT PRIMARY KEY AUTO_INCREMENT,
    jsonData JSON NOT NULL,
    winner VARCHAR(50),
    replay_date DATETIME NOT NULL
);`,
`CREATE TABLE IF NOT EXISTS User_replay(
    user_id INT NOT NULL,
    replay_id INT NOT NULL,
    
    PRIMARY KEY (user_id, replay_id),
    FOREIGN KEY (user_id) REFERENCES User (id),
    FOREIGN KEY (replay_id) REFERENCES Replay (id)
);`,
`CREATE TABLE IF NOT EXISTS User_relation(
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status char NOT NULL DEFAULT 'P',
    
    PRIMARY KEY(sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES User (id),
    FOREIGN KEY (receiver_id) REFERENCES User (id)
);`,
`CREATE TABLE IF NOT EXISTS Message(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message varchar(100) NOT NULL,
    seen BOOLEAN,
    stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id)   REFERENCES User (id),
    FOREIGN KEY (receiver_id) REFERENCES User (id)
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