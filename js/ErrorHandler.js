const ParseError = require('parse-error');
const Globals = require('./Globals.js');


exports.HandleError = async function (client, err) {
    try{
        if(!Globals.g_Client)
            return;
        var oGrooveUser = await Globals.g_Client.users.cache.get(Globals.g_GrooveID);
        oGrooveUser.send(
            "__**RUNTIME ERROR**__ \r\n\r\n"
            + (err.stack ? err.stack : err)
        )
        console.log(ParseError(err));
    }
    catch(e)
    {
        console.log("Silent Error: " + e.stack ? e.stack : e);
        console.log("Causal Error: " + err.stack ? err.stack : err);
    }
}