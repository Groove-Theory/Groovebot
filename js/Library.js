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
        let oResult = await Globals.Database.dbo.collection("ServerData").aggregate([
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

        let aCatNames = oResult.map(obj => obj.name);

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
        SendReplyMessage(client, newmsg, "Sorry, no name was found. Please try again.");
        LibraryFileAddWizardAskName(client, newmsg, oArgs)
    }
    else
    {
        oArgs["cName"] = cResponse;
        LibraryFileAddWizardConfirmAll(client, newmsg, oArgs);
    }
}

async function LibraryFileAddWizardConfirmAll(client, msg, oArgs)
{
    var cConfirmString = `Category: ${oArgs["cCatName"]}\r\n`
                        + `Name: ${oArgs["cName"]}\r\n`
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
    oInsertObj["cName"] = oArgs["cName"];
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

function getFileType(cPath)
{
    var re = /(?:\.([^.]+))?$/;
    return re.exec(cPath)[1].toUpperCase();
}

function checkIfMod(member)
{
    return member && member.hasPermission('MANAGE_GUILD');
}

function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}