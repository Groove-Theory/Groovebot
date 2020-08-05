const Globals = require('../Globals.js')
class ServerOptions {
    constructor(iGuildID) {
        this._iGuildID = iGuildID;
        this._iToggleAddRolesOnApprove = 0;
    }

    get iGuildID() {
        return this._iGuildID;
    }

    get RolesAddedOnApprove() {
        return this._iToggleAddRolesOnApprove;
    }

    async Query()
    {
        let oQueryObject = {
            guildID: this._iGuildID,
            production: Globals.Environment.PRODUCTION
        }

        let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);
        let oResult = aResult.length > 0 ? aResult[0] : null;

        this._iToggleAddRolesOnApprove = oResult["addroleonapprove"]     
    }
   
}

module.exports = ServerOptions