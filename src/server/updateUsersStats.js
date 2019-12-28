import {gameConfig} from "../../config/gameConfig";
let serverConfig = require('../../config/serverConfig');

module.exports = function (connection, req) {
    for (let [key, value] of new Map(JSON.parse(req.players)).entries()) {
        let winner = req.winner;
        let rankReward = serverConfig.RANK_POINTS_ON_LOSE;
        let levelReward = serverConfig.LEVEL_POINTS_ON_LOSE;
        if (value.username === winner) {
            rankReward = serverConfig.RANK_POINTS_ON_WIN;
            levelReward = serverConfig.LEVEL_POINTS_ON_WIN;
        }
        connection.query(`
                UPDATE Users 
                SET 
                rank_points = IF(rank_points + ? >= 0 AND rank_points + ? < ?, rank_points + ?, rank_points),
                level_points = level_points + ?,
                wins = IF (username = ?, wins + 1, wins)
                WHERE
                username = ?;
                `, [rankReward, rankReward, gameConfig.REQUIRED_POINTS_FOR_NEXT_RANK * 15, rankReward, levelReward, winner, value.username], (error) => {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    }
};