const Globals = require('../Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('./ErrorHandler.js')
const LibraryUtils = require('./LibraryUtils.js')

exports.PrintLibrary = function (client, msg)
{
    try
    {
        var aMsgContents = msg.content.split(/\s+/);
        var cCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[1] : ""

        var iMode = cCatName == "" ? 1 : 2; //1 = Categories, 2 = Files for a Category
        if(iMode == 1)
        {
            PrintCategories(client, msg)
        }
        else if(iMode == 2)
        {
            PrintFiles(client, msg, cCatName)
        }
    }
    catch(err)
    {
        LibraryUtils.SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

async function PrintCategories(client, msg)
{
    let oGuild = msg.guild;

    let oKeyObject = {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
    }
    let oReturn = {
        projection: { "librarycategories":1, _id:0 }
    }

    let aCatNames = await LibraryUtils.getCategoriesNamesArray(oGuild);

    if (!aCatNames || aCatNames.length == 0) {
        msg.channel.send("Sorry I can't find any categories for this server")
        return;
    }
    else
    {
        var cReturn = "**LIST OF LIBRARY CATEGORIES** \r\n```\r\n";
        let cCatNames = aCatNames.join("\r\n");
        cReturn += cCatNames;
        cReturn += "```";
        msg.channel.send(cReturn)
    }

}

async function PrintFiles(client, msg, cCatName)
{
    let oGuild = msg.guild;

    var aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
    { $match: {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION
    }},
    { $unwind: "$librarycategories"},
    { $match: {
        "librarycategories.name": cCatName
        }
    },
    { $project: {
            files: "$librarycategories.files",
            _id: 0
        }},
    ]).toArray();
    var oResult = aResult && aResult.length > 0 ? aResult[0] : null;
    if (!oResult) {
        msg.channel.send("Sorry I can't find that category for this server")
        return;
    }
    else
    {
        let aFiles = oResult.files;
        var cReturn = "**LIST OF FILES FOR CATEGORY: " + cCatName.toUpperCase() + "** \r\n```\r\n";
        for(var i = 0; i < aFiles.length; i++)
        {
            let oFile = aFiles[i];
            cReturn += LibraryUtils.printFileDescription(oFile) + "\r\n";
        }
        cReturn += "```"
        msg.channel.send(cReturn)
    }

}