const Globals = require('./Globals.js')
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");
const PaginationMessage = require("./Classes/PaginationMessage.js");
const PaginationButton = require("./Classes/PaginationButton.js");
const Discord = require('discord.js');

const oHelpText = new EmbeddedHelpText(
   "Help",
   "Gets a list of  help text for command(s) that can be used for Groovebot",
    "",
    "``<command-name>``: If this argument is passed, then a more detailed help text will be presented for that command. Type in 'mod' to get mod-only commands",
    "``g!help quote`` (get the help text for the ``quote`` command)"
)
exports.oHelpText = oHelpText

exports.Init = async function (client, msg) {

  var msgText = msg.content;
  var aMsgWords = msgText.split(" ");
  var cCommand = aMsgWords[1]
  let oCommandObj = cCommand ? Globals.aCommandMap.find(c => c.cCommand.toLowerCase() == cCommand.toLowerCase()) : null;

  if(cCommand)
  {
    if(oCommandObj && oCommandObj.oLongHelpText)
    {
      msg.channel.send(
        {
          embed: oCommandObj.oLongHelpText.oEmbedText
        });
    }
    else if(cCommand == "mod")
    {

      let oHelpMessage = await getHelpPageInfo(msg.channel, true, 0, null);
      let oPagMessage = new PaginationMessage();
      oPagMessage.addButton(new PaginationButton("◀", function(){getHelpPageInfo(msg.channel, true, -1, oHelpMessage)}, 1));
      oPagMessage.addButton(new PaginationButton('▶', function(){getHelpPageInfo(msg.channel, true, 1, oHelpMessage)}, 2));
      oPagMessage.oMessage = oHelpMessage
      await oPagMessage.Init();
    }
    else
    {
      msg.channel.send(`Sorry I don't have any info for the command '${cCommand}'`);
    }
  }
  else
  {
    let oHelpMessage = await getHelpPageInfo(msg.channel, false, 0, null);
    let oPagMessage = new PaginationMessage();
    oPagMessage.addButton(new PaginationButton("◀", function(){getHelpPageInfo(msg.channel, false, -1, oHelpMessage)}, 1));
    oPagMessage.addButton(new PaginationButton('▶', function(){getHelpPageInfo(msg.channel, false, 1, oHelpMessage)}, 2));
    oPagMessage.oMessage = oHelpMessage
    await oPagMessage.Init();
  }

}


async function getHelpPageInfo(oChannel, bMod, iDirection, oMessage)
{
  let oEmbed = oMessage && oMessage.embeds ? oMessage.embeds[0] : null;
  if(oEmbed)
  {
    let iPage = oEmbed.description ? oEmbed.description.substring(5) : null
    if(iPage)
    {
      let iNewPage = iPage + iDirection;
      let oCommandValues = Object.values(Globals.CommandTypeStrings)
      let cCommandKey = Object.keys(Globals.CommandTypeStrings).find(key => Globals.CommandTypeStrings[key].order === iNewPage);
      if(!cCommandKey)
        return;

        return printHelpEmbed(oChannel, cCommandKey, bMod, oMessage)
    }
  }
  else
    return printHelpEmbed(oChannel, "INFORMATION", bMod, null)
}

async function printHelpEmbed(oChannel, cCommandKey, bMod, oMessage)
{
  let aCommands = Globals.aCommandMap.filter(c => c.cCommandType == cCommandKey && c.bModOnly == bMod)
  let oHelpEmbed = new Discord.RichEmbed()
  .setColor('#0356fc')
  .setTitle(`${Globals.CommandTypeStrings[cCommandKey].cname} Commands`)
  .setDescription(`Page ${Globals.CommandTypeStrings[cCommandKey].order}`);

  for(let i = 0; i < aCommands.length; i++)
  {
    let oItem = aCommands[i];
    oHelpEmbed.addField(oItem.cHelpTextTitle, oItem._cShortHelpText, false); 
  }
  if(oMessage)
    return await oMessage.edit(oHelpEmbed)
  else
    return await oChannel.send(oHelpEmbed);
}


