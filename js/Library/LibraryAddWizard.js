const Globals = require('../Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('../ErrorHandler.js')
const LibraryUtils = require('./LibraryUtils.js')
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oAddFileHelpText = new EmbeddedHelpText(
    "library-add-file",
    "Starts a wizard to add a file to a category (mod only)",
     "",
     "",
     "``g!library-add-file`` (This will start the wizard)"
 )


exports.LibraryFileAddWizardSetup = async function(client, msg)
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
            msg.channel.send("Sorry, categories need to be set up before uploading files");
            return;
        }

        LibraryFileAddWizardAskCategory(client, msg, aCatNames);

    }
    catch(err)
    {
        LibraryUtils.SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
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
                title: "Please enter the category (or index number on the left) where you want to upload (type 'END' in caps to stop this wizard)\r\n",
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
        LibraryUtils.SendReplyMessage(client, newmsg, "Okie dokie then, stopping upload process");
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
        LibraryUtils.SendReplyMessage(client, newmsg, "Okie dokie then, stopping upload process");
        return;
    }

    let aAttachmentUrl = Array.from(  newmsg.attachments.values() );
    if(!aAttachmentUrl || aAttachmentUrl.length == 0)
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Sorry, no file was found. Please try again.");
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
        LibraryUtils.SendReplyMessage(client, newmsg, "Okie dokie then, stopping upload process");
        return;
    }
    else if(cResponse == "")
    {
        LibraryUtils.SendReplyMessage(client, newmsg, "Sorry, no title was found. Please try again.");
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

async function LibraryFileAddWizardUploadFile(client, msg, oArgs)
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


    await Globals.Database.dbo.collection("ServerData").update(
        {
            "guildID": oGuild.id,
            "production": false,
            "librarycategories.name": oArgs["cCatName"]
        },
        {
            $addToSet: { "librarycategories.$.files": oInsertObj }
        }
        )
    cMessage = "File Successfully Added!!"
    LibraryUtils.SendReplyMessage(client, msg, cMessage)

}