const Globals = require('../Globals.js')
class GroovePointMember {
  constructor(iGuildID, iUserID) {
    this._iGuildID = iGuildID;
    this._iUserID = iUserID;
    this._iAddPoints = 0;
    this._oInsertObject = {};
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
        this._oInsertObject["lastawardedmessagedate"] = x
    }

    get dLastRepDate() {
        return this._dLastRepDate;
    }
    set dLastRepDate(x) {
        this._dLastRepDate = x;
        this._oInsertObject["dlastrepdate"] = x
    }

    get dLastPackageDate() {
        return this._dLastPackageDate;
    }
    set dLastPackageDate(x) {
        this._dLastPackageDate = x;
        this._oInsertObject["dlastpackagedate"] = x
    }

    get iPoints() {
        return this._iPoints;
    }

    addPoints(iVal)
    {
        this._iAddPoints += iVal;
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
        this._dLastPackageDate = oResult && oResult["dlastpackagedate"] ? oResult["dlastpackagedate"] : new Date('1970-01-01');


    }
    UpdateUser()
    {
        var oKeyObject = {
            guildID: this._iGuildID,
            userID: this._iUserID
        }
        let oUpdateObject = {};
        if(Object.keys(this._oInsertObject).length > 0)
            oUpdateObject["$set"] = this._oInsertObject
        oUpdateObject["$inc"] =  { "points": this._iAddPoints}

        Globals.Database.dbo.collection("GroovePoints").updateOne(oKeyObject, oUpdateObject, {
            upsert: true,
            safe: false
        });
        //Globals.Database.Upsert("GroovePoints", oKeyObject, oInsertObject);
    }

}

module.exports = GroovePointMember