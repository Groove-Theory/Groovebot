const Globals = require('./Globals.js')
exports.Init = function(client, msg)
{
  var cMessage = msg.content;
  var cNewNick = msg.content.substring(11);

  var oGuild = msg.guild; // client.guilds.get(Globals.g_GuildID);
  var oGrooveUser = oGuild.members.find(m => m.id === Globals.g_GrooveID);

  oGrooveUser.setNickname(cNewNick).catch(function(err)
  {
    console.log(err);
    console.log(oGuild);
    msg.channel.send("....Actually nah that name sucks not gonna do it")

  }).then(msg.channel.send("Hehehehe, I changed Groove's name to **" + cNewNick + "**"));
}
