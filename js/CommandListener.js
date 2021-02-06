const Globals = require('./Globals.js')
const Dictionary = require('./Dictionary.js')
const RateLimit = require('./RateLimit.js')
const ErrorHandler = require('./ErrorHandler.js')

exports.ProcessMessage = async function(client, msg) {
    try
    {
        let cCommandPrefix = Globals.cCommandPrefix;

        if (msg.author.id == client.user.id)
            return;  

        var msgChannel = client.channels.cache.get(msg.channel.id);
        var msgText = msg.content;
        var aMsgWords = msgText.split(" ");
        var cMsgCommand = aMsgWords && aMsgWords.length > 0 ? aMsgWords[0] : null;

        if(cMsgCommand.startsWith(cCommandPrefix))
        {
            if(!RateLimit.HandleUserCommand(msg.author))
            {
                RateLimitErrorMessage(msg.channel, msg.author);
                return;
            }
            let cCommand = cMsgCommand.substr(cMsgCommand.indexOf(cCommandPrefix) + cCommandPrefix.length);
            let oCommandObj = Globals.aCommandMap.find(c => c.cCommand == cCommand)

            if(oCommandObj)
                oCommandObj.fFunc(client, msg)
            else
            {
                msgChannel.send("The fuck is that shit?");
            }
        }
        else if(cMsgCommand.startsWith("t!wiki")) // Tatsu exception
        {
                Dictionary.Init(client, msg);
        }
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err)
    }
}

function RateLimitErrorMessage(oChannel, oUser){
    let seconds = RateLimit.GetUserTimeoutSeconds(oUser);
    oChannel.send(`Chill the fuck out for like ${seconds} seconds, <@${oUser.id}>`);
}
