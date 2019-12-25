module.exports = function (connection, req) {
    let sql = `INSERT INTO Replays (
        jsonData,
        winner,
        replay_date) VALUES (?, ?, NOW())`;
    let data = [
        req.replay,
        req.winner,
    ];
    connection.query(sql, data, function (error, result) {
        if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        let replayId = result.insertId;
        for (let [key, value] of new Map(JSON.parse(req.players)).entries()) {
            connection.query(`select id From Users where username = ?`, [value.username], (error, result) => {
                if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
                let sql2 = `INSERT INTO User_replay (user_id, replay_id) 
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
};
