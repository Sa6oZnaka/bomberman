import {User} from "../api/User";

let mysql = require('mysql');
let databaseConfig = require('../../config/dbconfig');
let connection = mysql.createConnection(databaseConfig);

connection.query('USE ' + databaseConfig.database);

module.exports = {

    save: function (req, res, next) {
        let sql = `INSERT INTO REPLAYS (
        jsonData,
        winner,
        replay_date) VALUES (?, ?, ?)`;
        let data = [
            req.replay,
            "0",
            new Date()
        ];
        connection.query(sql, data, function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
            let replayId = result.insertId;
            for (let [key, value] of new Map(JSON.parse(req.players)).entries()) {
                connection.query(`select id From Users where username = ?`, [value.username], (error, result) => {
                    if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
                    let sql2 = `INSERT INTO USER_REPLAY (user_id, replay_id) 
                                VALUES (?, ?);`;
                    let data2 = [
                        result[0].id,
                        replayId
                    ];
                    connection.query(sql2, data2, (error) => {
                        if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
                    });
                });
            }
        });
    },

    load: function (req, res, next) {
        console.log("load");
    }

};
