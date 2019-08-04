const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');

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
