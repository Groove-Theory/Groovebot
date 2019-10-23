const GroovePointMember = require("../Classes/GroovePointMember.js");

async function ProcessEmojiAdd(reaction, user, aGoodGroovePointEmojiIDs, aBadGroovePointEmojiIDs)
{
    let oMember = reaction.message.member;
    let oGuild = reaction.message.guild;
    if(oMember.user.bot) return;

    let oGroovePointMember = new GroovePointMember(oGuild.id, oMember.id);
    await oGroovePointMember.InitUser();

    let iReactID = reaction.emoji.id;

    if(aGoodGroovePointEmojiIDs.indexOf(iReactID) > -1)
    {
        oGroovePointMember.addPoints(100);
        oGroovePointMember.UpdateUser();
    }
    else if(aBadGroovePointEmojiIDs.indexOf(iReactID) > -1)
    {
        oGroovePointMember.addPoints(-100);
        oGroovePointMember.UpdateUser();
    }
}
exports.ProcessEmojiAdd = ProcessEmojiAdd

async function ProcessEmojiRemove(reaction, user, aGoodGroovePointEmojiIDs, aBadGroovePointEmojiIDs)
{
    let oMember = reaction.message.member;
    let oGuild = reaction.message.guild;
    if(oMember.user.bot) return;

    let oGroovePointMember = new GroovePointMember(oGuild.id, oMember.id);
    await oGroovePointMember.InitUser();

    let iReactID = reaction.emoji.id;

    if(aGoodGroovePointEmojiIDs.indexOf(iReactID) > -1)
    {
        oGroovePointMember.addPoints(-100);
        oGroovePointMember.UpdateUser();
    }
    else if(aBadGroovePointEmojiIDs.indexOf(iReactID) > -1)
    {
        oGroovePointMember.addPoints(100);
        oGroovePointMember.UpdateUser();
    }
}
exports.ProcessEmojiRemove = ProcessEmojiRemove

function getRandomValue(iMin, iMax)
{
    return Math.floor(Math.random() * iMax) + iMin
}