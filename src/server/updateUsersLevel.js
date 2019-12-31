let serverConfig = require('../../config/serverConfig');

module.exports = function (connection, req) {
    for (let [key, value] of new Map(JSON.parse(req.players)).entries()) {
        let levelReward;

        if (value.username === req.winner)
            levelReward = serverConfig.LEVEL_POINTS_ON_WIN;
        else if (req.winner === null)
            levelReward = serverConfig.LEVEL_POINTS_ON_DRAW;
        else
            levelReward = serverConfig.LEVEL_POINTS_ON_LOSE;
        connection.query(`
                UPDATE Users 
                SET 
                level_points = level_points + ?
                WHERE
                username = ?;
                `, [levelReward, value.username], (error) => {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    }
};