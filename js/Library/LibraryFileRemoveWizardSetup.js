const Globals = require('../Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('../ErrorHandler.js')
const LibraryUtils = require('./LibraryUtils.js')

exports.LibraryFileRemoveWizardSetup = async function(client, msg)
{
    try
    {
        var oMember = msg.member;
        if(!LibraryUtils.checkIfMod(oMember))
        {
            msg.channel.send("Sorry, you need the 'Manage Server' permission to use this command :sob: ");
            return;
        }
        let oGuild = msg.guild;

        let aCatNames = await LibraryUtils.getCategoriesNamesArray(oGuild);

        if(!aCatNames || aCatNames.length == 0)
        {
            msg.channel.send("Sorry, no categories exist... so.... there's nothing to delete....");
            return;
        }

        LibraryFileRemoveWizardAskCategory(client, msg, aCatNames);

    }
    catch(err)
    {
        LibraryUtils.SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

async function LibraryFileRemoveWizardAskCategory(client, msg, aCatNames)
{
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "Please enter the category (or index number on the left) where you want to delete from (type 'END' in caps to stop this wizard)\r\n",
                description: LibraryUtils.printCategoriesWithIndex(aCatNames)
            }
        })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,
        {
            time: 120000
        });
    collector.on('collect', newmsg => {
        try {
            collector.stop();
            LibraryFileRemoveWizardProcessCategory(client, newmsg, aCatNames)
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function LibraryFileRemoveWizardProcessCategory(client, newmsg, aCatNames)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Okie dokie then, stopping delete process");
        return;
    }

    let cCatName = null
    if(Number.isInteger(parseInt(cResponse)))
    {
        cCatName = aCatNames[parseInt(cResponse) - 1];
    }
    else
    {
        cCatName = aCatNames.find(item => cResponse.toUpperCase() === item.toUpperCase())
    }

    if(!cCatName)
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Sorry, that's not a valid category");
        LibraryFileRemoveWizardAskCategory(client, newmsg, aCatNames)
    }
    else
    {
        let oArgs = {"cCatName" : cCatName, "aCatNames": aCatNames, "oGuild": newmsg.guild}
        LibraryFileRemoveWizardAskFile(client, newmsg, oArgs);
    }

}

async function LibraryFileRemoveWizardAskFile(client, msg, oArgs)
{
    let cCatName = oArgs.cCatName
    let aCatFilesData = await LibraryUtils.getFilesData(oArgs.oGuild, oArgs.cCatName);
    if(!aCatFilesData || aCatFilesData.length == 0)
    {
        LibraryUtils.SendReplyMessage(client, msg, "Sorry, there's no files in this category, please choose another");
        GetLibraryFileWizardAskCategory(client, msg, oArgs.oGuild, oArgs.aCatNames)
    }
    else
    {
        let cFilesDescriptions = await LibraryUtils.printMultipleFilesDescription(aCatFilesData);
        await msg.channel.send(
            {
                embed:
                {
                    color: 3447003,
                    title: "Please Choose which file you want to delete (type in the name or the index number on the left-hand side)\r\n",
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
                LibraryFileRemoveWizardProcessFile(client, newmsg, oArgs, aCatFilesData)
            }
            catch (err) {
                ErrorHandler.HandleError(client, err);
            }
        });
    }
}

function LibraryFileRemoveWizardProcessFile(client, newmsg, oArgs, aCatFilesData)
{
    let cResponse = newmsg.content;
    if(cResponse == "END")
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Okie dokie then, stopping checkout process");
        return;
    }

    let oChosenFile = null
    if(Number.isInteger(parseInt(cResponse)))
    {
        oChosenFile = aCatFilesData[parseInt(cResponse) - 1];
    }
    else
    {
        oChosenFile = aCatFilesData.filter(obj => obj.name == "cResponse")[0]
    }

    if(!oChosenFile)
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Sorry, that's not a valid file name or index");
        GetLibraryFileWizardAskFile(client, newmsg, aCatNames)
    }
    else
    {
        oArgs["oChosenFile"] = oChosenFile;
        LibraryFileRemoveWizardConfirmAll(client, newmsg, oArgs);
    }

}

async function LibraryFileRemoveWizardConfirmAll(client, msg, oArgs)
{
    var cConfirmString = `Category: ${oArgs["cCatName"]}\r\n`
                        + `Title: ${oArgs["oChosenFile"].cTitle}\r\n`
    await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: "PLEASE CONFIRM THIS IS WHAT YOU WANT TO DELETE (type 'Y' to confirm, 'N' to cancel process)\r\n",
                description: cConfirmString,
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
                LibraryFileRemoveWizardRemoveFile(client, newmsg, oArgs)
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

function LibraryFileRemoveWizardRemoveFile(client, msg, oArgs)
{
    let oGuild = msg.guild;

    let oKeyObject = {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
        "librarycategories.name": oArgs["cCatName"]
    }

    let oOptions = {};
    let cMessage = "Uh oh, there may have been an error..."

    oOptions = {
        $pull: { "librarycategories.$.files.cAttachmentID": oArgs["oChosenFile"].cAttachmentID }
    }
    cMessage = "File Successfully Removed!!"


    Globals.Database.UpsertCustom(client, "ServerData", oKeyObject, oOptions, LibraryUtils.SendReplyMessage(client, msg, cMessage));
}