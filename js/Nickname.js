const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Nickname",
  "Change Groove's Nickname on the server! Note: The bot must have higher permissions than Groove",
   "``<name>`` new nickname written as a string. This must be 32 characters or less",
   "",
   "``g!nickname Nicholas Name`` (this will change Groove's name to 'Nicholas Name')"
)


exports.Init = async function (client, msg) {
  try {
    var cMessage = msg.content;
    var cNewNick = msg.content.substring(11);
    cNewNick = Globals.cleanString(cNewNick);

    var oGuild = msg.guild; // client.guilds.cache.get(Globals.g_GuildID);
    var oGrooveUser = oGuild.members.cache.find(m => m.id === Globals.g_GrooveID);

    await oGrooveUser.setNickname(cNewNick)
    msg.channel.send("Hehehehe, I changed Groove's name to **" + cNewNick + "**");
  }
  catch (err) {
    try{
      if(StringIsBad(cNewNick) ) // Todo: Get Cheesecord or write findmention string checker
        throw "bad mention nick"
      var oGrooveBotUser = oGuild.members.cache.find(m => m.id ===client.user.id);
      await oGrooveBotUser.setNickname(cNewNick)
      msg.channel.send("Ok, I changed my name to **" + cNewNick + "**..... I like it!");
    }
    catch(err)
    {
      msg.channel.send("....Nah that name sucks not gonna do it");
      ErrorHandler.HandleError(client, err);
    }
  }
}

function StringIsBad(cString)
{
  return cString.indexOf("@") > -1;
}