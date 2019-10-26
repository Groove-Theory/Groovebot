const GroovePointMember = require("../Classes/GroovePointMember.js");
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");
const Discord = require('discord.js');
const Globals = require("../Globals.js");

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

    printLeaderboard(oGuild, oAuthor, msg.channel, iPage);
}
exports.ParseInputForLeaderboard = ParseInputForLeaderboard;

async function printLeaderboard(oGuild, oAuthor, oChannel, iPage)
{
    let aData = await getLeaderboardData(oGuild.id, iPage);
    let oEmbed = new Discord.RichEmbed()
                    .setColor('#c0ff28')
                    .setTitle('GroovePoints Leaderboard')
                    .setDescription(`Page ${iPage} (Ranks ${((iPage-1)*10)+1}-${((iPage)*10)})`);
    for(let i = 0; i < 10; i++)
    {
        let oItem = aData[((iPage-1) * 10 )+ i];
        if(oItem)
        {
            let oMember = oGuild.members.find(m => m.id == oItem.userID)
            if(oMember)
                oEmbed.addField(`${((iPage-1) * 10 )+ i +1}) ${oMember.user.username} `, oItem.points, false); 
        }
    }

    let oAuthorData = aData.find(x => x.userId = oAuthor.id)
    let iAuthorRank = aData.findIndex(x => x.userId = oAuthor.id);
    if(oAuthorData)
        oEmbed.setFooter( `Your rank = #${iAuthorRank + 1}   (${oAuthorData.points} Points)`);
    oChannel.send(oEmbed);
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