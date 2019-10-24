const Globals = require('../Globals.js')
class GroovePointMember {
  constructor(iGuildID, iUserID) {
    this._iGuildID = iGuildID;
    this._iUserID = iUserID;
  }
    get iGuildID() {
        return this._iGuildID;
    }
    get iUserID() {
        return this._iUserID;
    }

    get dLastMessage() {
        return this._dLastMessage;
    }
    set dLastMessage(x) {
        this._dLastMessage = x;
    }

    get dLastRepDate() {
        return this._dLastRepDate;
    }
    set dLastRepDate(x) {
        this._dLastRepDate = x;
    }

    get iPoints() {
        return this._iPoints;
    }

    addPoints(iVal)
    {
        this._iPoints += iVal;
    }

    async InitUser()
    {
        var oQueryObject = {
            guildID: this._iGuildID,
            userID: this._iUserID
        }

        let aResult = await Globals.Database.Query("GroovePoints", oQueryObject);
        let oResult = aResult.length > 0 ? aResult[0] : null;

        this._iPoints = oResult && oResult["points"] ? oResult["points"] : 0;
        this._dLastMessage = oResult && oResult["lastawardedmessagedate"] ? oResult["lastawardedmessagedate"] : new Date();
        this._dLastRepDate = oResult && oResult["dlastrepdate"] ? oResult["dlastrepdate"] : new Date('1970-01-01');

    }
    UpdateUser()
    {
        var oKeyObject = {
            guildID: this._iGuildID,
            userID: this._iUserID
        }
        var oInsertObject = {
            "points": this._iPoints,
            "lastawardedmessagedate": this._dLastMessage,
            "dlastrepdate": this._dLastRepDate
        };

        Globals.Database.Upsert("GroovePoints", oKeyObject, oInsertObject);
    }

}

module.exports = GroovePointMember