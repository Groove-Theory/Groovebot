
const Globals = require('./Globals.js');
const ErrorHandler = require('./ErrorHandler.js');
exports.Init = async function (client, msg) {
    try {
        var msgChannel = client.channels.get(msg.channel.id);
        var oMentionedUsers = msg.mentions.users;
        var cMsg = "";
        if (oMentionedUsers.size > 0) {
            oMentionedUsers.forEach(function (guildMember) {
                cMsg += "<@" + guildMember.id + "> ";
            })
        }
        else {
            cMsg += "<@" + msg.author.id + "> ";
        }


        var cComplimentText = Globals.aCompliments[Math.floor(Math.random() * Globals.aCompliments.length)];

        cMsg += cComplimentText;
        msgChannel.send(cMsg);
    }
    catch (err) {
        ErrorHandler.HandleError(client, err)
    }
}


