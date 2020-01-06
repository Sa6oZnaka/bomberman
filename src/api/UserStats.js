import {gameConfig} from "../../config/gameConfig.js";
import {RankEnum} from "../enums/RankEnum.js";

export class UserStats {

    constructor(levelPoints, rankPoints, wins) {
        this.levelPoints = levelPoints;
        this.rankPoints = rankPoints;
        this.wins = wins;
    }

    getRankId() {
        return Math.floor(this.rankPoints / gameConfig.REQUIRED_POINTS_FOR_NEXT_RANK);
    }

    getRank() {
        return RankEnum[this.getRankId()];
    }

    getLevel() {
        return Math.floor(this.levelPoints / gameConfig.REQUIRED_POINTS_FOR_NEXT_LEVEL);
    }

    getNextLevelProgress() { // % to next level
        return (this.levelPoints - (this.getLevel() * gameConfig.REQUIRED_POINTS_FOR_NEXT_LEVEL)) / gameConfig.REQUIRED_POINTS_FOR_NEXT_LEVEL;
    }

    static getRankByPoints(points){
        return Math.floor(points / gameConfig.REQUIRED_POINTS_FOR_NEXT_RANK);
    }

}