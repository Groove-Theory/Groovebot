const Globals = require('../Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('../ErrorHandler.js')

exports.getCategoriesNamesArray = getCategoriesNamesArray;
exports.getFilesData = getFilesData;
exports.printMultipleFilesDescription = printMultipleFilesDescription;
exports.printFileDescription = printFileDescription;
exports.checkIfMod = checkIfMod;
exports.SendReplyMessage = SendReplyMessage;
exports.printCategoriesWithIndex = printCategoriesWithIndex;

async function getCategoriesNamesArray(oGuild)
{
    let aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
        { $match: {
            "guildID": oGuild.id,
            "production": Globals.Environment.PRODUCTION
        }},
        { $unwind: "$librarycategories"},
        { $sort : { "librarycategories.name" : 1 } },
        { $project: {
            name: "$librarycategories.name",
                _id: 0
            }},
        ]).toArray();

    let aCatNames = aResult.map(obj => obj.name);
    return aCatNames;
}

async function getFilesData(oGuild, cCatName)
{
    let aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
    {
        $match: {
            "guildID": oGuild.id,
            "production": false
        }
    },
    {
        $unwind: "$librarycategories"
    },
    {
        $match: {
            "librarycategories.name": cCatName
        }
    },
    { $sort : { "librarycategories.files.cTitle" : 1, } },
    {
        $project: {
            files: "$librarycategories.files",
            _id: 0
        }
    },
    ]).toArray();
    return aResult && aResult.length > 0 ? aResult[0].files : null
}



function getFileType(cPath)
{
    return cPath.split('.').pop().toUpperCase();
}

async function printMultipleFilesDescription(aFiles)
{
    let cReturn = "";
    for(var i = 0; i < aFiles.length; i++)
    {
        cReturn += `(${i+1}) ${printFileDescription(aFiles[i])} \r\n`;
    }

    return cReturn;
}

function printFileDescription(oFile)
{
    let cPath = oFile.cAttachmentURL
    let cFileExt = getFileType(cPath);
    return `${oFile.cTitle} (${cFileExt})`
}

function printCategoriesWithIndex(aCatNames)
{
    let strRet = "";
    aCatNames.forEach((elem, index) => strRet += `${index+1}) ${elem}\r\n`)
    return strRet;
}

async function checkIfMod(member)
{
    return member && member.hasPermission('MANAGE_GUILD');
}

async function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}