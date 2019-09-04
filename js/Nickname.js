const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');

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

    var oGuild = msg.guild; // client.guilds.get(Globals.g_GuildID);
    var oGrooveUser = oGuild.members.find(m => m.id === Globals.g_GrooveID);

    await oGrooveUser.setNickname(cNewNick)
    msg.channel.send("Hehehehe, I changed Groove's name to **" + cNewNick + "**");
  }
  catch (err) {
    msg.channel.send("....Nah that name sucks not gonna do it");
    ErrorHandler.HandleError(client, err);

  }
}
