const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const snoowrap = require('snoowrap');
const Discord = require('discord.js');
const { ModMailStream, Poll } = require("snoostorm");



const iVulgarChannelID = Globals.Environment.PRODUCTION ? "737897387565121567" : "737819633691656274"
exports.Init = async function (client, msg) {
    try{
        let oVulgarChannel = Globals.g_Client.channels.cache.get(iVulgarChannelID);
        var oSubreddit = await Globals.redditAPI.getSubreddit('COMPLETEANARCHY');

        let poll = setInterval(
            async function(){
                var aLogs = await oSubreddit.get_moderation_log({count: 30, limit: 30, type:"banuser,removelink,spamcomment,removecomment,muteuser"});
                aLogs = aLogs.map(l => l.mod != "AutoModerator");
                HandleModLogStream(aLogs, oVulgarChannel)
            },
            60000
        );
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}

async function HandleModLogStream(aLogs, oVulgarChannel)
{
    let fetchedMessages = await oVulgarChannel.messages.fetch({ limit: 100 });
    let prevMessageIDs = fetchedMessages.map(m => m.content.replace("ModLogID = ", ""));
    for(oLog of aLogs)
    {
        if(prevMessageIDs.indexOf(oLog.id) == -1)
            await CreateModLogEmbedMessage(oLog, oVulgarChannel );
    }
    
}

async function CreateModLogEmbedMessage(oLog, oVulgarChannel) {
    let oEmbed = null;
    if(oLog.action == "banuser")
        oEmbed = CreateBanUserEmbed(oLog, oVulgarChannel);
    else if(oLog.action == "removelink")
        oEmbed = CreateRemoveLinkEmbed(oLog, oVulgarChannel);
    else if(oLog.action == "spamcomment")
        oEmbed = CreateSpamCommentEmbed(oLog, oVulgarChannel);
    else if(oLog.action == "removecomment")
        oEmbed = CreateRemoveCommentEmbed(oLog, oVulgarChannel);
    else if(oLog.action == "muteuser")
        oEmbed = CreateMuteUserEmbed(oLog, oVulgarChannel);

    if(oEmbed)
    {
        let cTopMessage = `ModLogID = ${oLog.id}`
        await oVulgarChannel.send(cTopMessage, oEmbed);
    }
}

function CreateBanUserEmbed(oLog, oVulgarChannel) {
    const attachment = new Discord.MessageAttachment("./images/banned.png", 'image.png');
    const embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(`USER BANNED!`)
        .addField("Banned User", `[/u/${oLog.target_author}](https://www.reddit.com/user/${oLog.target_author})`, false)
        .addField("Reason", clipString(oLog.description), false)
        .addField("Mod who did it", oLog.mod, false)
        .attachFiles(attachment)
        .setThumbnail('attachment://image.png')
        .setTimestamp();
    return embed;
}

function CreateRemoveLinkEmbed(oLog, oVulgarChannel) {
    const attachment = new Discord.MessageAttachment("./images/removelink.png", 'image.png');
    const embed = new Discord.MessageEmbed()
        .setColor("ORANGE")
        .setTitle(`POST REMOVED!`)
        .addField("Naughty User", `[/u/${oLog.target_author}](https://www.reddit.com/user/${oLog.target_author})`, false)
        .addField("Permalink", `[Reddit Link](https://www.reddit.com${oLog.target_permalink})`, false)
        .addField("Post Title", `${clipString(oLog.target_title)}`, false)
        .addField("Mod who did it", oLog.mod, false)
        .attachFiles(attachment)
        .setThumbnail('attachment://image.png')
        .setTimestamp();
    return embed;
}

function CreateSpamCommentEmbed(oLog, oVulgarChannel) {
    const attachment = new Discord.MessageAttachment("./images/spam.png", 'image.png');
    const embed = new Discord.MessageEmbed()
        .setColor("YELLOW")
        .setTitle(`SPAM COMMENT REMOVED!`)
        .addField("Naughty User", `[/u/${oLog.target_author}](https://www.reddit.com/user/${oLog.target_author})`, false)
        .addField("Permalink", `[Reddit Link](https://www.reddit.com${oLog.target_permalink})`, false)
        .addField("Comment Text", `${clipString(oLog.target_body)}`, false)
        .addField("Mod who did it", oLog.mod, false)
        .attachFiles(attachment)
        .setThumbnail('attachment://image.png')
        .setTimestamp();
    return embed;
}


function CreateRemoveCommentEmbed(oLog, oVulgarChannel) {
    const attachment = new Discord.MessageAttachment("./images/removecomment.png", 'image.png');
    const embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle(`COMMENT REMOVED!`)
        .addField("Naughty User", `[/u/${oLog.target_author}](https://www.reddit.com/user/${oLog.target_author})`, false)
        .addField("Permalink", `[Reddit Link](https://www.reddit.com${oLog.target_permalink})`, false)
        .addField("Comment Text", `${clipString(oLog.target_body)}`, false)
        .addField("Mod who did it", oLog.mod, false)
        .attachFiles(attachment)
        .setThumbnail('attachment://image.png')
        .setTimestamp();
    return embed;
}

function CreateMuteUserEmbed(oLog, oVulgarChannel) {
    const attachment = new Discord.MessageAttachment("./images/mute.png", 'image.png');
    const embed = new Discord.MessageEmbed()
        .setColor("PURPLE")
        .setTitle(`USER MUTED!`)
        .addField("Naughty User", `[/u/${oLog.target_author}](https://www.reddit.com/user/${oLog.target_author})`, false)
        .addField("Reason", `${clipString(oLog.description)}`, false)
        .addField("Mod who did it", oLog.mod, false)
        .attachFiles(attachment)
        .setThumbnail('attachment://image.png')
        .setTimestamp();
    return embed;
}

function clipString(cString, iLength = 1000)
{
    return cString.length > iLength ? cString.substring(0,iLength) + "..." : cString
}