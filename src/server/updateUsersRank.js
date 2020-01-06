import {gameConfig} from "../../config/gameConfig";

let serverConfig = require('../../config/serverConfig');

module.exports = function (connection, req) {
    for (let [key, value] of new Map(JSON.parse(req.players)).entries()) {
        let rankReward;
        if (value.username === req.winner)
            rankReward = rewardOnWin(value.rank, req.rank);
        else if (req.winner === null)
            rankReward = rewardOnDraw(value.rank, req.rank);
        else
            rankReward = rewardOnLose(value.rank, req.rank);
        connection.query(`
                UPDATE Users 
                SET 
                rank_points = IF(rank_points + ? >= 1 AND rank_points + ? < ?, rank_points + ?, rank_points),
                wins = IF (username = ?, wins + 1, wins)
                WHERE
                username = ?;
                `, [rankReward, rankReward, gameConfig.REQUIRED_POINTS_FOR_NEXT_RANK * 15, rankReward, req.winner, value.username], (error) => {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    }

    function rewardOnLose(userPoints, avgRank) {
        let rankReward = -(userPoints / avgRank);
        if (rankReward < serverConfig.MAX_RANK_POINTS_ON_LOSE)
            return serverConfig.MAX_RANK_POINTS_ON_LOSE;
        return rankReward;
    }

    function rewardOnWin(userPoints, avgRank) {
        let rankReward = avgRank / userPoints;
        if (rankReward > serverConfig.MAX_RANK_POINTS_ON_WIN)
            return serverConfig.MAX_RANK_POINTS_ON_WIN;
        return rankReward;
    }

    function rewardOnDraw(userPoints, avgRank) {
        if (userPoints < avgRank)
            return avgRank / userPoints;
        return -(userPoints / avgRank);
    }

};