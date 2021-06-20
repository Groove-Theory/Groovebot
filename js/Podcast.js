const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const Discord = require('discord.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");


exports.Init = async function (client, msg) {

  iGuildId = "190543951080456192";
  iPodcastChannelID = "856062925415383060";
  try {
    if(msg.channel.guild.id != iGuildId)
      return;

    let aData = msg.content.split(/\s+/);
    aData.shift();

    if(!aData || aData.length == 0)
    {
        msg.channel.send("You gotta give me a topic.... I mean, shit fam.")
        return;
    }

    let cString = aData.join(" ");

    let pChannel = Globals.g_Client.channels.cache.get(iPodcastChannelID);
    var embed = new Discord.MessageEmbed()
        .setColor("#D65930")
        .setTitle(`New Podcast Topic!`)
        .setDescription("__***" + cString + "***__")
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL({size:1024, format: "png"}))
        .setFooter(`Remember to use (g!podcast <topic>) to give us something to talk about`)
    
    pChannel.send("", embed)

  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}
