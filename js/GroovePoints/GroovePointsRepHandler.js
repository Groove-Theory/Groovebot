const GroovePointMember = require("../Classes/GroovePointMember.js");
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");
const Globals = require("../Globals.js");

exports.oHelpText = new EmbeddedHelpText(
  "Rep",
  "Give GroovePoints to someone you like (random between 1000 to 5000 GroovePoints)! 24 hours time limit beteen giving reps to anyone",
   "``<user>`` a MENTIONED user to give points too",
   "",
   "``g!rep @Lisa `` (This will give Lisa a bunch of GroovePoints)"
)

async function GiveRep(client, msg)
{
    let oMentions = msg.mentions;
    let oMentionedUser = msg.mentions.members.values().next().value;
    let oGuild = msg.guild;
    let oAwarder = msg.author;
    if(!oMentionedUser)
    {
        msg.channel.send("Sorry, cannot find user")
        return;
    }
    if(oMentionedUser.user.bot)
    {
        msg.channel.send("Sorry, you cannot rep bots")
        return;
    }
    if(oMentionedUser.id == oAwarder.id)
    {
        msg.channel.send("Sorry, you can't give yourself rep")
        return;
    }

    let oGroovePointMemberAwarder = new GroovePointMember(oGuild.id, oAwarder.id);
    await oGroovePointMemberAwarder.InitUser();

    let iMilliSecondsUntilNextRep = oGroovePointMemberAwarder.dLastRepDate.getTime() - new Date().getTime() + (1000 *3600*24)
    if(iMilliSecondsUntilNextRep > 0)
    {
        msg.channel.send(`Sorry, you cannot rep any user for ${timeConversion(iMilliSecondsUntilNextRep)}`)
        return;
    }

    let oGroovePointMemberReceiver = new GroovePointMember(oGuild.id, oMentionedUser.id);
    await oGroovePointMemberReceiver.InitUser();

    let iPointsAwarded = Globals.getRandomValue(1000, 5000);
    oGroovePointMemberReceiver.addPoints(iPointsAwarded);
    oGroovePointMemberAwarder.dLastRepDate = new Date();
    await oGroovePointMemberReceiver.UpdateUser();
    await oGroovePointMemberAwarder.UpdateUser();

    msg.channel.send(`I've awarded **${iPointsAwarded}** GroovePoints:tm: to <@${oGroovePointMemberReceiver.iUserID}>`)

}
exports.GiveRep = GiveRep;

 function timeConversion(millisec) {

    var seconds = (millisec / 1000).toFixed(1);
    var minutes = (millisec / (1000 * 60)).toFixed(1);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) {
        return seconds + " Sec";
    } else if (minutes < 60) {
        return minutes + " Min";
    } else if (hours < 24) {
        return hours + " Hrs";
    } else {
        return days + " Days"
    }
}