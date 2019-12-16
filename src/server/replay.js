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

        update(sql, data);
    },

    load: function (req, res, next) {
        console.log("load");
    }

};

function update(sql, data) {
    connection.query(sql, data, (error, results, fields) => {
        if (error) {
            return console.error("\x1b[33m" + error.message + "\x1b[0m");
        }
        if (results.affectedRows !== 1) {
            console.log('\x1b[33mRows affected:', results.affectedRows + "\x1b[0m");
        }
    });
}