
const Globals = require('./Globals.js');
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
    "Compliment",
    "Lets Groovebot tells you or someone else compliment!",
     "",
     "``<user>`` mention a user to direct a compliment towards them!",
     "``g!compliment @Groove`` (this will give Groove a compliment)"
 )


exports.Init = async function (client, msg) {
    try {
        var msgChannel = client.channels.cache.get(msg.channel.id);
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
        cMsg = Globals.cleanString(cMsg);
        msgChannel.send(cMsg);
    }
    catch (err) {
        ErrorHandler.HandleError(client, err)
    }
}



