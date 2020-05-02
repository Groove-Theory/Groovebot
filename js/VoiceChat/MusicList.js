const Globals = require('../Globals.js')
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");
const PaginationMessage = require("../Classes/PaginationMessage.js");
const PaginationButton = require("../Classes/PaginationButton.js");
const Discord = require('discord.js');
const ErrorHandler = require('../ErrorHandler.js');
const MusicTrack = require('../Classes/MusicTrack.js');

const iEntriesPerList = 5;

exports.WriteList = async function (aData, cTitle, oChannel) {
  try {

    let oHelpMessage = await getHelpPageInfo(aData, oChannel, cTitle, 0, null);
    let oPagMessage = new PaginationMessage();
    oPagMessage.addButton(new PaginationButton("◀", function(){getHelpPageInfo(aData, oChannel, cTitle, -1, oHelpMessage)}, 1));
    oPagMessage.addButton(new PaginationButton('▶', function(){getHelpPageInfo(aData, oChannel, cTitle, 1, oHelpMessage)}, 2));
    oPagMessage.oMessage = oHelpMessage
    await oPagMessage.Init();
  }
  catch (err) {
    ErrorHandler.HandleError(Globals.g_Client, err);
  }
}


async function getHelpPageInfo(aData, oChannel, cTitle, iDirection, oMessage)
{
  let oEmbed = oMessage && oMessage.embeds ? oMessage.embeds[0] : null;
  if(oEmbed)
  {
    let iPage = oEmbed.description ? oEmbed.description.substring(5) : null
    if(iPage)
    {
        let iNewPage = Math.max(parseInt(iPage) + iDirection, 1);
        iNewPage = Math.min(iNewPage, Math.ceil(aData.length/iEntriesPerList))
        return printListEmbed(aData, cTitle, oChannel, iNewPage, oMessage)
    }
  }
  else
    return printListEmbed(aData, cTitle, oChannel, 1, oMessage)
}

async function printListEmbed(aData, cTitle, oChannel, iPage, oMessage, cInfoText)
{
  let aPageData = aData.filter((data, index) => index >= ((iPage-1) * iEntriesPerList) && index < ((iPage) * iEntriesPerList))
  cInfoText = cInfoText ? cInfoText : "Here ya go!";
  let oHelpEmbed = new Discord.MessageEmbed()
  .setColor('#0356fc')
  .setTitle(cTitle)
  .setDescription(`Page ${iPage}`)
  .setFooter(`Page ${iPage} of ${Math.ceil(aData.length/iEntriesPerList)}`)
  if(aPageData.length == 0)
  {
    oHelpEmbed.addField("Nothing found", false); 
  }
  else
  {
    for(let i = 0; i < aPageData.length; i++)
    {
        let oItem = aPageData[i];
        let oTrack = oItem.constructor.name != "MusicTrack" ? new MusicTrack(oItem) : oItem;
        let cInfoString = `${oTrack.cDescription} [Link](${oTrack.cURL})`;
        let cNameString = `${(((iPage-1) * iEntriesPerList) + i)+1})`
        cNameString += (oTrack.cUserName && oTrack.cDurationString) ? `Added by ${oTrack.cUserName}, (${oTrack.cDurationString})` : "Result: "
        oHelpEmbed.addField(cNameString, cInfoString, false); 
    }
  }
  if(oMessage)
    return await oMessage.edit(cInfoText, oHelpEmbed)
  else
    return await oChannel.send(cInfoText, oHelpEmbed);
}
