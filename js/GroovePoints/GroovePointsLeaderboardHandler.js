const GroovePointMember = require("../Classes/GroovePointMember.js");
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");
const PaginationMessage = require("../Classes/PaginationMessage.js");
const PaginationButton = require("../Classes/PaginationButton.js");
const Discord = require('discord.js');
const Globals = require("../Globals.js");

const iRanksPerPage = 10;
exports.oHelpText = new EmbeddedHelpText(
    "Leaderboard",
    "Find out your place on the GroovePoints:tm: leaderboards",
     "",
     "``<page>`` skip to a specific page number of the leaderboard (10 entries per page)",
     "``g!leaderboard 3 `` (This will give the third page (21-30) of the leaderboard of your guild)"
  )

async function ParseInputForLeaderboard(client, msg)
{
    let aMsgContents = msg.content.split(/\s+/);
    let iPage = aMsgContents[1]
    if(!iPage || iPage < 1)
        iPage = 1;
    
    let oAuthor = msg.author;
    let oGuild = msg.guild;
    if(!oAuthor) return;

    let oLeaderBoardMessage = await printLeaderboard(oGuild, oAuthor, msg.channel, iPage);
    let oPagMessage = new PaginationMessage();
    oPagMessage.addButton(new PaginationButton("◀", function(){editLeaderboardMessage(oGuild, oAuthor, oLeaderBoardMessage, -1)}, 1));
    oPagMessage.addButton(new PaginationButton('▶', function(){editLeaderboardMessage(oGuild, oAuthor, oLeaderBoardMessage, 1)}, 2));
    oPagMessage.oMessage = oLeaderBoardMessage
    await oPagMessage.Init();
}
exports.ParseInputForLeaderboard = ParseInputForLeaderboard;

// -1 = Reverse, 1 = Forward
async function editLeaderboardMessage(oGuild, oAuthor, oMessage, iDirection)
{
  let oEmbed = oMessage.embeds[0];
  if(oEmbed)
  {
    let aPageData = oEmbed.description ? oEmbed.description.substring(5).split("/") : null
    if(aPageData)
    {
      let iCurrentPage = parseInt(aPageData[0]);
      let iTotalPages = parseInt(aPageData[1]);
      if(!Number.isInteger(iCurrentPage) || !Number.isInteger(iCurrentPage))
        return;
      if(iCurrentPage >= iTotalPages && iDirection == 1)
        return;
      if(iCurrentPage <= 1 && iDirection == -1)
        return

      await printLeaderboard(oGuild, oAuthor, oMessage.channel, iCurrentPage + iDirection, oMessage)
    }
  }
}

async function printLeaderboard(oGuild, oAuthor, oChannel, iPage, oMessage)
{
    let aData = await getLeaderboardData(oGuild.id, iPage);
    let oEmbed = new Discord.RichEmbed()
                    .setColor('#c0ff28')
                    .setTitle('GroovePoints Leaderboard')
                    .setDescription(`Page ${iPage}/${Math.ceil(aData.length/iRanksPerPage)}`);
    for(let i = 0; i < iRanksPerPage; i++)
    {
        let oItem = aData[((iPage-1) * iRanksPerPage )+ i];
        if(oItem)
        {
            let oMember = oGuild.members.find(m => m.id == oItem.userID)
            if(oMember)
                oEmbed.addField(`${((iPage-1) * iRanksPerPage )+ i +1}) ${oMember.user.username} `, oItem.points, false); 
        }
    }

    let oAuthorData = aData.find(x => x.userID == oAuthor.id)
    let iAuthorRank = aData.findIndex(x => x.userID== oAuthor.id);
    if(oAuthorData)
        oEmbed.setFooter( `Your rank = #${iAuthorRank + 1}   (${Globals.NumToSuffixedString(oAuthorData.points)} Points)`);
    if(oMessage)
      return await oMessage.edit(oEmbed)
    else
      return await oChannel.send(oEmbed);
}

async function getLeaderboardData(iGuildId, iPage)
{
    var aResult = await Globals.Database.dbo.collection("GroovePoints").aggregate([
        {
          '$match': {
            'guildID': iGuildId
          }
        }, {
          '$sort': {
            'points': -1
          }
        }
      ]).toArray();
    return aResult;
    
}

// async function getMemberLeaderboardData(iGuildId, iMemberID, iPage)
// {
//     var aResult = await Globals.Database.dbo.collection("GroovePoints").aggregate([
//         {
//           '$match': {
//             'guildID': iGuildId,
//             "userID": iMemberID
//           }
//         },
//       ]).toArray();
//     return aResult;
    
// }