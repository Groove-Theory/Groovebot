const Globals = require('./Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('./ErrorHandler.js')

exports.HandleType = {
    ADD: 1,
    DELETE: 2,
    EDIT: 3
  };

exports.HandleLibraryCategory = function(client, msg, iHandleType)
{
    try
    {
        var oMember = msg.member;
        if(!checkIfMod(oMember))
        {
            msg.channel.send("Sorry, you need the 'Manage Server' permission to use this command :sob: ");
            return;
        }

        var aMsgContents = msg.content.split(/\s+/);
        var cCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[1] : ""

        if(cCatName == "")
        {
            SendReplyMessage(client, msg, "Please enter a category name");
            return;
        }

        let oGuild = msg.guild;

        let oKeyObject = {
            guildID: oGuild.id,
            production: Globals.Environment.PRODUCTION,
        }

        let oOptions = {};
        let cMessage = "Uh oh, there may have been an error..."
        if(iHandleType == exports.HandleType.ADD)
        {
            oOptions = {
                $addToSet: { librarycategories: {name: cCatName, files:[]} }
            }
            cMessage = "Category **'" + cCatName + "'** successfully added";
        }
        else if(iHandleType == exports.HandleType.DELETE)
        {
            oOptions = {
                $pull: { librarycategories: {name: cCatName } }
            }
            cMessage = "Category **'" + cCatName + "'** has been removed";
        }
        else if(iHandleType == exports.HandleType.EDIT)
        {
            let cNewCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[2] : "";
            oKeyObject["librarycategories.name"] = cCatName
            if(cNewCatName)
            {
                oOptions = {
                    $set: { "librarycategories.$.name": cNewCatName}
                }
                cMessage = "Category '**" + cCatName + "**' has been renamed to '**" + cNewCatName + "**'";
            }
        }

        Globals.Database.UpsertCustom("ServerData", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));
    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

exports.LibraryFileAddWizardSetup = async function(client, msg)
{
    try
    {
        var oMember = msg.member;
        if(!checkIfMod(oMember))
        {
            msg.channel.send("Sorry, you need the 'Manage Server' permission to use this command :sob: ");
            return;
        }
        let oGuild = msg.guild;

        let aCatNames = await getCategoriesNamesArray(oGuild);

        if(!aCatNames || aCatNames.length == 0)
        {
            msg.channel.send("Sorry, categories need to be set up before uploading files");
            return;
        }

        LibraryFileAddWizardAskCategory(client, msg, aCatNames);

    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

async function LibraryFileAddWizardAskCategory(client, msg, aCatNames)
{
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "Please enter the category where you want to upload (type 'END' in caps to stop this wizard)\r\n",
                description: aCatNames.join("\r\n"),
            }
        })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
        {
            time: 120000
        });
    collector.on('collect', newmsg => {
        try {
            collector.stop();
            LibraryFileAddWizardProcessCategory(client, newmsg, aCatNames)
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function LibraryFileAddWizardProcessCategory(client, newmsg, aCatNames)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        SendReplyMessage(client, newmsg, "Okie dokie then, stopping upload process");
        return;
    }
    var cCatName = aCatNames.find(item => cResponse.toUpperCase() === item.toUpperCase()) 
    if(!cCatName)
    {
        SendReplyMessage(client, newmsg, "Sorry, that's not a valid category");
        LibraryFileAddWizardAskCategory(client, newmsg, aCatNames)
    }
    else
    {
        let oArgs = {"cCatName" : cCatName}
        LibraryFileAddWizardAskFile(client, newmsg, oArgs);
    }

}

async function LibraryFileAddWizardAskFile(client, msg, oArgs)
{
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "Please upload your file (or paste link if acceptable) (type 'END' in caps to stop this wizard)\r\n",
                description: "Standard Discord uploading limits apply to this wizard. Please only upload one file; if you upload more than one, only the first attachment will be accepted",
            }
        })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
        {
            time: 120000
        });
    collector.on('collect', newmsg => {
        try {
            collector.stop();
            LibraryFileAddWizardProcessFile(client, newmsg, oArgs)
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function LibraryFileAddWizardProcessFile(client, newmsg, oArgs)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        SendReplyMessage(client, newmsg, "Okie dokie then, stopping upload process");
        return;
    }

    let aAttachmentUrl = Array.from(  newmsg.attachments.values() );
    if(!aAttachmentUrl || aAttachmentUrl.length == 0)
    {
        SendReplyMessage(client, newmsg, "Sorry, no file was found. Please try again.");
        LibraryFileAddWizardAskFile(client, newmsg, oArgs)
    }
    else
    {
        oArgs["cAttachmentURL"] = aAttachmentUrl[0].url;
        oArgs["cAttachmentID"] = aAttachmentUrl[0].id;
        LibraryFileAddWizardAskName(client, newmsg, oArgs);
    }

}

async function LibraryFileAddWizardAskName(client, msg, oArgs)
{
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "Please type in the title for this work (type 'END' in caps to stop this wizard)\r\n",
                description: "",
            }
        })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
        {
            time: 120000
        });
    collector.on('collect', newmsg => {
        try {
            collector.stop();
            LibraryFileAddWizardProcessName(client, newmsg, oArgs)
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function LibraryFileAddWizardProcessName(client, newmsg, oArgs)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        SendReplyMessage(client, newmsg, "Okie dokie then, stopping upload process");
        return;
    }
    else if(cResponse == "")
    {
        SendReplyMessage(client, newmsg, "Sorry, no title was found. Please try again.");
        LibraryFileAddWizardAskName(client, newmsg, oArgs)
    }
    else
    {
        oArgs["cTitle"] = cResponse;
        LibraryFileAddWizardConfirmAll(client, newmsg, oArgs);
    }
}

async function LibraryFileAddWizardConfirmAll(client, msg, oArgs)
{
    var cConfirmString = `Category: ${oArgs["cCatName"]}\r\n`
                        + `Title: ${oArgs["cTitle"]}\r\n`
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "PLEASE CONFIRM YOUR ENTRY (type 'Y' to confirm, 'N' to cancel process)\r\n",
                description: cConfirmString,
                file: oArgs["cAttachmentURL"],
            }
        })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
        {
            time: 120000
        });
    collector.on('collect', newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "N") {
                collector.stop();
                newmsg.channel.send("Ok, terminating upload process then... :sob:");
            }
            else if (newmsg.content == "Y") {
                collector.stop();
                LibraryFileAddWizardUploadFile(client, newmsg, oArgs)
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function LibraryFileAddWizardUploadFile(client, msg, oArgs)
{
    let oGuild = msg.guild;

    oInsertObj ={};
    oInsertObj["cTitle"] = oArgs["cTitle"];
    oInsertObj["cAttachmentID"] = oArgs["cAttachmentID"];
    oInsertObj["cAttachmentURL"] = oArgs["cAttachmentURL"];

    let oKeyObject = {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
        "librarycategories.name": oArgs["cCatName"]
    }

    let oOptions = {};
    let cMessage = "Uh oh, there may have been an error..."

    oOptions = {
        $addToSet: { "librarycategories.$.files": oInsertObj }
    }
    cMessage = "File Successfully Added!!"


    Globals.Database.UpsertCustom("ServerData", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));
}

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
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
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

    let aCatNames = await getCategoriesNamesArray(oGuild);

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
            cReturn += printFileDescription(oFile) + "\r\n";
        }
        cReturn += "```"
        msg.channel.send(cReturn)
    }

}

exports.GetLibraryFileWizardSetup = async function(client, msg)
{
    let oGuild = msg.guild;

    let aCatNames = await getCategoriesNamesArray(oGuild); 

    if (!aCatNames || aCatNames.length == 0) {
        msg.channel.send("Sorry I can't find that any categories for this server")
        return;
    }
    else
    {
        GetLibraryFileWizardAskCategory(client, msg, oGuild, aCatNames);
    }

}

async function GetLibraryFileWizardAskCategory(client, msg, oGuild, aCatNames)
{
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "Please enter the category where you want to checkout from (type 'END' in caps to stop this wizard)\r\n",
                description: aCatNames.join("\r\n"),
            }
        })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
        {
            time: 120000
        });
    collector.on('collect', newmsg => {
        try {
            collector.stop();
            GetLibraryFileWizardProcessCategory(client, newmsg, oGuild, aCatNames)
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function GetLibraryFileWizardProcessCategory(client, newmsg, oGuild, aCatNames)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        SendReplyMessage(client, newmsg, "Okie dokie then, stopping checkout process");
        return;
    }
    var cCatName = aCatNames.find(item => cResponse.toUpperCase() === item.toUpperCase()) 
    if(!cCatName)
    {
        SendReplyMessage(client, newmsg, "Sorry, that's not a valid category");
        GetLibraryFileWizardAskCategory(client, newmsg, aCatNames)
    }
    else
    {
        let oArgs = {"aCatNames": aCatNames, "cCatName" : cCatName, "oGuild" : oGuild}
        GetLibraryFileWizardAskFile(client, newmsg, oArgs);
    }

}

async function GetLibraryFileWizardAskFile(client, msg, oArgs)
{
    let cCatName = oArgs.cCatName
    let aCatFilesData = await getFilesData(oArgs.oGuild, oArgs.cCatName);
    if(!aCatFilesData || aCatFilesData.length == 0)
    {
        SendReplyMessage(client, msg, "Sorry, there's no files in this category, please choose another");
        GetLibraryFileWizardAskCategory(client, msg, oArgs.oGuild, oArgs.aCatNames)
    }
    else
    {
        let cFilesDescriptions = printMultipleFilesDescription(aCatFilesData);
        await msg.channel.send(
            {
                embed:
                {
                    color: 3447003,
                    title: "Please Choose which file you want to checkout (type in the name or the index number on the left-hand side)\r\n",
                    description: cFilesDescriptions,
                }
            })

        var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
            {
                time: 120000
            });
        collector.on('collect', newmsg => {
            try {
                collector.stop();
                GetLibraryFileWizardProcessAndSendFile(client, newmsg, oArgs, aCatFilesData)
            }
            catch (err) {
                ErrorHandler.HandleError(client, err);
            }
        });
    }
}

function GetLibraryFileWizardProcessAndSendFile(client, newmsg, oGuild, aCatFilesData)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        SendReplyMessage(client, newmsg, "Okie dokie then, stopping checkout process");
        return;
    }

    let oChosenFile = null
    if(Number.isInteger(parseInt(cResponse)))
    {
        oChosenFile = aCatFilesData[parseInt(cResponse) - 1];
    }
    else
    {
        oChosenFile = a.filter(obj => obj.name == "cResponse")[0]
    }

    if(!oChosenFile)
    {
        SendReplyMessage(client, newmsg, "Sorry, that's not a valid file name or index");
        GetLibraryFileWizardAskFile(client, newmsg, aCatNames)
    }
    else
    {
        newmsg.channel.send(
            {
                files: [
                    oChosenFile.cAttachmentURL
                ]
            });
    }

}

////////////////////////////////HELPER FUNCTIONS ///////////////

async function getCategoriesNamesArray(oGuild)
{
    let aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
        { $match: {
            "guildID": oGuild.id,
            "production": Globals.Environment.PRODUCTION
        }},
        { $unwind: "$librarycategories"},
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

function printMultipleFilesDescription(aFiles)
{
    let cReturn = "";
    for(var i = 0; i < aFiles.length; i++)
    {
        cReturn += `(${i+1}) ${printFileDescription(aFiles[i])}`;
    }

    return cReturn;
}

function printFileDescription(oFile)
{
    let cPath = oFile.cAttachmentURL
    let cFileExt = getFileType(cPath);
    return `${oFile.cTitle} (${cFileExt})`
}

function checkIfMod(member)
{
    return member && member.hasPermission('MANAGE_GUILD');
}

function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}