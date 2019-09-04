const Globals = require('../Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('../ErrorHandler.js')
const LibraryUtils = require('./LibraryUtils.js')

exports.oRemoveFileHelpText = new EmbeddedHelpText(
    "library-get-file",
    "Starts a wizard to get a file to a category (mod only)",
     "",
     "",
     "``g!library-get-file`` (This will start the wizard)"
 )

exports.GetLibraryFileWizardSetup = async function(client, msg)
{
    let oGuild = msg.guild;

    let aCatNames = await LibraryUtils.getCategoriesNamesArray(oGuild);

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
                title: "Please enter the category (or index number on the left) where you want to checkout from (type 'END' in caps to stop this wizard)\r\n",
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
        LibraryUtils.SendReplyMessage(client, newmsg, "Okie dokie then, stopping checkout process");
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
    let aCatFilesData = await LibraryUtils.getFilesData(oArgs.oGuild, oArgs.cCatName);
    if(!aCatFilesData || aCatFilesData.length == 0)
    {
        LibraryUtils.SendReplyMessage(client, msg, "Sorry, there's no files in this category, please choose another");
        GetLibraryFileWizardAskCategory(client, msg, oArgs.oGuild, oArgs.aCatNames)
    }
    else
    {
        let cFilesDescriptions = LibraryUtils.printMultipleFilesDescription(aCatFilesData);
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
        oChosenFile = a.filter(obj => obj.name == "cResponse")[0]
    }

    if(!oChosenFile)
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Sorry, that's not a valid file name or index");
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