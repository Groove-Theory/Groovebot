const Discord = require('discord.js');
const Globals = require('../Globals.js');

function getStarIconByNum(iNum, bPassedThreshold)
{
    if(iNum >= 20)
        return "💫";
    if(iNum >= 15)
        return "🌠";
    if(iNum >= 10)
        return "🌟";
    if(bPassedThreshold || iNum >= 5)
        return "⭐"
}

function IsStar(react) {
    return react.emoji.name == "⭐";
}

function GetStarCount(msg) {
    let oStarReacts = msg.reactions.cache.find(r => exports.IsStar(r));
    return oStarReacts ? oStarReacts.count : 0;
}

function PassedStarboardThreshold(msg, iThreshold) {
    return GetStarCount(msg) >= (iThreshold ? iThreshold : 5);
}

async function CreateNewStarboardMessage(msg, oStarboardChannel, oArgs) {
  
    let cStarIcon =  getStarIconByNum(oArgs["iStarCount"],  true );
    let cTopMessage = `**${oArgs["iStarCount"]}** ${cStarIcon}  by ${msg.author.username} in <#${msg.channel.id}>`
    const image = msg.attachments.size > 0 ? msg.attachments.array()[0].url : '';
    const embed = new Discord.MessageEmbed()
        .setColor("GOLD")
        .setDescription(msg.content)
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL({size:1024, format: "png"}))
        .setTimestamp()
        .addField("Go to Message", "[Link](" + msg.url + ")", false)
        .setFooter(`⭐ ${msg.author.id}|${oArgs["iStarCount"]}| ${msg.id}`)
        .setImage(image);
    let oStarMessage = await oStarboardChannel.send(cTopMessage, embed);
    return oStarMessage;
}

async function EditStarboardMessage(msg, oStarboardMessage, oArgs) {
    let cStarIcon =  getStarIconByNum(oArgs["iStarCount"], true);
    let cTopMessage = `**${oArgs["iStarCount"]}** ${cStarIcon}  by ${msg.author.username} in <#${msg.channel.id}>`
    const image = msg.attachments.size > 0 ? msg.attachments.array()[0].url : '';
    const embed = new Discord.MessageEmbed()
        .setColor("GOLD")
        .setDescription(msg.content)
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL({size:1024, format: "png"}))
        .setTimestamp()
        .addField("Go to Message", "[Link](" + msg.url + ")", false)
        .setFooter(`⭐ ${msg.author.id}|${oArgs["iStarCount"]}| ${msg.id}`)
        .setImage(image);
    oStarboardMessage.edit(cTopMessage, embed);

}

exports.IsStar = IsStar;
exports.GetStarCount = GetStarCount;
exports.PassedStarboardThreshold = PassedStarboardThreshold;
exports.CreateNewStarboardMessage = CreateNewStarboardMessage;
exports.EditStarboardMessage = EditStarboardMessage;
