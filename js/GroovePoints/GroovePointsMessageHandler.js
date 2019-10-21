function processMessage(client, msg)
{
    let oMember = msg.member;

}

function awardPoints(oGroovePointMember)
{
    let bAward = checkForTimeout(oGroovePointMember.dLastMessage, 1000*60*2);
    if(bAward)
    {
        oGroovePointMember.iPoints += getRandomValue(1, 10);
    }
}

function checkForTimeout(dLastMessage, iTimeoutMilliSec)
{
    let dNow = new Date()
    return dNow.getTime() > dLastMessage.getTime + iTimeoutMilliSec;
}

function getRandomValue(iMin, iMax)
{
    return Math.floor(Math.random() * iMax) + iMin
}