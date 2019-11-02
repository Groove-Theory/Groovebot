const GroovePointMember = require("../Classes/GroovePointMember.js");
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");
const Globals = require("../Globals.js");

exports.oHelpText = new EmbeddedHelpText(
  "Daily",
  "Get your daily GroovePoints:tm: value with a random number of Groovepoints. Can only do once every 24 hours.",
   "",
   "'`<user>`` a MENTIONED user to give a package to. No user will just give the package to you by default",
   "``g!daily @Karen `` (This will give Karen your daily points package)"
)

async function HandleDailyPackage(client, msg)
{
    let oMentions = msg.mentions;
    let oMentionedUser = msg.mentions.members.values().next().value;
    let oGuild = msg.guild;
    let oAwarder = msg.author;
    let bIsBot = false;
    let bSelfAward = true;
    if(!oMentionedUser)
    {
        oMentionedUser = msg.author;
        bIsBot = oMentionedUser.bot;
    }
    else
    {
        bSelfAward = false;
        bIsBot = oMentionedUser.user.bot;
    }
    if(bIsBot)
    {
        msg.channel.send("Sorry, you cannot give your daily packages to bots")
        return;
    }
    if(bSelfAward)
        await HandleDailyPackageSelf(oGuild, oAwarder, msg.channel);
    else
        await HandleDailyPackageGift(oGuild, oAwarder, oMentionedUser, msg.channel);
    
}
exports.HandleDailyPackage = HandleDailyPackage;

async function HandleDailyPackageSelf(oGuild, oAwarder, oChannel)
{
    let oGroovePointMember = new GroovePointMember(oGuild.id, oAwarder.id);
    await oGroovePointMember.InitUser();

    let iMilliSecondsUntilNextRep = oGroovePointMember.dLastPackageDate.getTime() - new Date().getTime() + (1000 *3600*24)
    if(iMilliSecondsUntilNextRep > 0)
    {
        oChannel.send(`Sorry, you cannot get another daily package for **${Globals.MillisecondsToTimeString(iMilliSecondsUntilNextRep)}**`)
        return;
    }

    let iPointsAwarded = Globals.getRandomInt(-1000, 5000);
    oGroovePointMember.addPoints(iPointsAwarded);
    oGroovePointMember.dLastPackageDate = new Date();
    oGroovePointMember.UpdateUser();

    if(iPointsAwarded > 0)
        oChannel.send(`Your daily package had **${iPointsAwarded}** GroovePoints:tm:, and I've awarded them to <@${oGroovePointMember.iUserID}>`)
    else
        oChannel.send(`Oof....Your daily package had **${iPointsAwarded}** GroovePoints:tm: :sob:... and I've taken them away from <@${oGroovePointMember.iUserID}>`)
}

async function HandleDailyPackageGift(oGuild, oAwarder, oMentionedUser, oChannel)
{
    let oGroovePointMemberAwarder = new GroovePointMember(oGuild.id, oAwarder.id);
    await oGroovePointMemberAwarder.InitUser();

    let iMilliSecondsUntilNextRep = oGroovePointMemberAwarder.dLastPackageDate.getTime() - new Date().getTime() + (1000 *3600*24)
    if(iMilliSecondsUntilNextRep > 0)
    {
        oChannel.send(`Sorry, you cannot get another daily package for **${Globals.MillisecondsToTimeString(iMilliSecondsUntilNextRep)}**`)
        return;
    }

    let oGroovePointMemberReceiver = new GroovePointMember(oGuild.id, oMentionedUser.id);
    await oGroovePointMemberReceiver.InitUser();

    let iPointsAwarded = Globals.getRandomInt(-1000, 5000);
    oGroovePointMemberReceiver.addPoints(iPointsAwarded);
    oGroovePointMemberAwarder.dLastPackageDate = new Date();
    await oGroovePointMemberReceiver.UpdateUser();
    await oGroovePointMemberAwarder.UpdateUser();

    if(iPointsAwarded > 0)
        oChannel.send(`Your daily package had **${iPointsAwarded}** GroovePoints:tm:, and I've awarded them to <@${oGroovePointMemberReceiver.iUserID}>`)
    else
        oChannel.send(`Oof....Your daily package had **${iPointsAwarded}** GroovePoints:tm: :sob:... and I've taken them away from <@${oGroovePointMemberReceiver.iUserID}>`)
}