const Globals = require("./Globals.js");
const ErrorHandler = require("./ErrorHandler.js");

exports.Init = async function Init(client, msg) {
  try {
    const cNewNick = msg.content.substring(11);

    const oGuild = msg.guild; // client.guilds.get(Globals.g_GuildID);
    const oGrooveUser = oGuild.members.find(m => m.id === Globals.g_GrooveID);

    await oGrooveUser.setNickname(cNewNick);
    msg.channel.send(`Hehehehe, I changed Groove's name to **${cNewNick}**`);
  } catch (err) {
    msg.channel.send("....Nah that name sucks not gonna do it");
    ErrorHandler.HandleError(client, err);
  }
};
