const Discord = require('discord.js');
const Globals = require('../Globals.js');

let oSBLeaderboardType = {
    "STARS": 1,
    "STARGIVERS": 2,
    "MESSAGES": 3
}

function IsPin(react) {
    return react.emoji.name == "📌";
}

function GetPinCount(msg) {
    let oStarReacts = msg.reactions.find(r => exports.IsPin(r));
    return oStarReacts ? oStarReacts.count : 0;
}

function PassedPinboardThreshold(msg, iThreshold) {
    return GetPinCount(msg) >= iThreshold;
}

async function CreateNewPinboardMessage(msg, pinner, oPinboardChannel, oArgs) {
    const image = msg.attachments.size > 0 ? msg.attachments.array()[0].url : '';
    const embed = new Discord.RichEmbed()
        .setColor("RED")
        .setDescription(msg.content)
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
        .setTimestamp()
        .addField("Go to Message", "[Link](" + msg.url + ")", false)
        .setFooter(`📌 Pinned by ${pinner.username}*| ${msg.id}`, pinner.displayAvatarURL)
        .addField("Go to Message", msg.url, false)
        .setImage(image);
    let oStarMessage = await oPinboardChannel.send(embed);
    return oStarMessage;
}

async function EditPinboardMessage(msg, pinner, oPinboardMessage, oArgs) {
    const image = msg.attachments.size > 0 ? msg.attachments.array()[0].url : '';
    const embed = new Discord.RichEmbed()
        .setColor("RED")
        .setDescription(msg.content)
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
        .setTimestamp()
        .addField("Go to Message", "[Link](" + msg.url + ")", false)
        .setFooter(`📌 Pinned by ${pinner.username} | ${msg.id}`, pinner.displayAvatarURL)
        .setImage(image);
    oPinboardMessage.edit(embed);

}

// function UpsertPinboardAddReactDB(msg, user, oPinboardMessage, oArgs) {

//     let oKeyObject = {
//         guildID: msg.guild.id,
//         messageID: msg.id,
//         authorID: msg.author.id,
//         channelID: msg.channel.id,
//     }

//     var oUpsertDataObj = {};
//     oUpsertDataObj["stars"] = oArgs["iPinCount"];
//     oUpsertDataObj["Pinboardmessageid"] = oArgs["bPassedThreshold"] ? oPinboardMessage.id : null;


//     Globals.Database.dbo.collection("PinboardData").updateOne(oKeyObject, {
//         $set: oUpsertDataObj,
//         $addToSet: { "starredby": user.id }
//     }, {
//         upsert: true,
//         safe: false
//     });

// }


// function UpsertPinboardRemoveReactDB(msg, user, oPinboardMessage, oArgs) {
//     let oKeyObject = {
//         guildID: msg.guild.id,
//         messageID: msg.id,
//         authorID: msg.author.id,
//         channelID: msg.channel.id,
//     }

//     var oUpsertDataObj = {};
//     oUpsertDataObj["stars"] = oArgs["iPinCount"];
//     oUpsertDataObj["Pinboardmessageid"] = oArgs["bPassedThreshold"] ? oPinboardMessage.id : null;

//     Globals.Database.dbo.collection("PinboardData").updateOne(oKeyObject, {
//         $set: oUpsertDataObj,
//         $pull: { "starredby": user.id }
//     }, {
//         upsert: true,
//         safe: false
//     });
// }


// function DeletePinboardReactDB(msg, user, oPinboardMessage, oArgs) {
//     let oKeyObject = {
//         guildID: msg.guild.id,
//         messageID: msg.id,
//         authorID: msg.author.id,
//         channelID: msg.channel.id,
//     }

//     var oUpsertDataObj = {};
//     oUpsertDataObj["stars"] = oArgs["iPinCount"];
//     oUpsertDataObj["Pinboardmessageid"] = oArgs["bPassedThreshold"] ? oPinboardMessage.id : null;

//     Globals.Database.Delete("PinboardData", oKeyObject);
// }

function IsMod(user, guild) {
    let oMember = guild.members.find(m => m.id == user.id);
    return oMember && oMember.hasPermission('MANAGE_GUILD')
}


exports.IsPin = IsPin;
exports.GetPinCount = GetPinCount;
exports.PassedPinboardThreshold = PassedPinboardThreshold;
exports.CreateNewPinboardMessage = CreateNewPinboardMessage;
exports.EditPinboardMessage = EditPinboardMessage;
exports.IsMod = IsMod;
// exports.UpsertPinboardAddReactDB = UpsertPinboardAddReactDB;
// exports.UpsertPinboardRemoveReactDB = UpsertPinboardRemoveReactDB;
// exports.DeletePinboardReactDB = DeletePinboardReactDB;