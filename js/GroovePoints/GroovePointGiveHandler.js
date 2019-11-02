const GroovePointMember = require("../Classes/GroovePointMember.js");
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");
const Globals = require("../Globals.js");

exports.oHelpText = new EmbeddedHelpText(
  "GivePoints",
  "Donate any of your GroovePoints:tm: to any other user.",
   "``<points>`` Numeric value of points to give \r\n ``<user>`` a MENTIONED user to give points to",
   "",
   "``g!givepoints 1000 @Ben `` (This will give Ben 1000 of your points)"
)

async function HandleGivePoints(client, msg)
{
    let aMsgContents = msg.content.split(/\s+/);
    let iPointsToAward = parseInt(aMsgContents[1]);
    let oMentionedUser = msg.mentions.members.values().next().value;
    let oGuild = msg.guild;
    let oAwarder = msg.author;
    if(!oMentionedUser)
    {
        msg.channel.send("Sorry, you must specify a user to give to. Type in ``g!help give`` for more help.")
        return;
    }
    if(!iPointsToAward || !Number.isInteger(iPointsToAward))
    {
        msg.channel.send("Sorry, you must specify a number of points to give. Type in ``g!help givepoints`` for more help.")
        return;
    }
    if(iPointsToAward <= 0)
    {
        msg.channel.send("Sorry, you must specify a number greater than 0. Type in ``g!help givepoints`` for more help.")
        return;
    }
    if(oMentionedUser.user.bot)
    {
        msg.channel.send("Sorry, you cannot give your points to bots. Type in ``g!help givepoints`` for more help.")
        return;
    }
    
    await TransferGroovePoints(oGuild, oAwarder, oMentionedUser, msg.channel, iPointsToAward);
    
}
exports.HandleGivePoints = HandleGivePoints;

async function TransferGroovePoints(oGuild, oAwarder, oMentionedUser, oChannel, iPointsToAward)
{
    let oGroovePointMemberAwarder = new GroovePointMember(oGuild.id, oAwarder.id);
    await oGroovePointMemberAwarder.InitUser();

    let oGroovePointMemberReceiver = new GroovePointMember(oGuild.id, oMentionedUser.id);
    await oGroovePointMemberReceiver.InitUser();

    if(oGroovePointMemberAwarder.iPoints < iPointsToAward)
    {
        oChannel.send(`Sorry, you only have **${oGroovePointMemberAwarder.iPoints}** GroovePoints:tm: to give.`)
        return;
    }

    oGroovePointMemberReceiver.addPoints(iPointsToAward);
    oGroovePointMemberAwarder.addPoints(-1 * iPointsToAward);
    await oGroovePointMemberReceiver.UpdateUser();
    await oGroovePointMemberAwarder.UpdateUser();

    
    oChannel.send(`You have given **${iPointsToAward}** GroovePoints:tm: to <@${oGroovePointMemberReceiver.iUserID}>!!`)
}