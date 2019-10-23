const GroovePointMember = require("../Classes/GroovePointMember.js");

async function ProcessMessage(client, msg)
{
    let oMember = msg.member;
    let oGuild = msg.guild;
    if(oMember.user.bot) return;

    let oGroovePointMember = new GroovePointMember(oGuild.id, oMember.id);
    await oGroovePointMember.InitUser();
    awardPoints(oGroovePointMember, msg.createdAt);
    oGroovePointMember.UpdateUser();
}
exports.ProcessMessage = ProcessMessage;

function awardPoints(oGroovePointMember, dMsgDate)
{
    let bAward = checkForTimeout(oGroovePointMember.dLastMessage, 1000*60*2);
    if(bAward)
    {
        oGroovePointMember.addPoints(getRandomValue(10, 100));
        oGroovePointMember.dLastMessage = dMsgDate;
    }
}

function checkForTimeout(dLastMessage, iTimeoutMilliSec)
{
    let dNow = new Date()
    return dNow.getTime() > dLastMessage.getTime() + iTimeoutMilliSec;
}

function getRandomValue(iMin, iMax)
{
    return Math.floor(Math.random() * iMax) + iMin
}