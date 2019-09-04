const Globals = require('../Globals.js');
const Discord = require('discord.js');
const ErrorHandler = require('../ErrorHandler.js')
const LibraryUtils = require('./LibraryUtils.js')


exports.oAddCategoryHelpText = new EmbeddedHelpText(
    "library-add-category",
    "Add a Library Category for the server to put files in (Mod Command only)",
     "``<catname>`` Name of the library-category (cannot have spaces)",
     "",
     "``g!library-add-category shoes`` (Adds the category 'shoes')"
 )
 exports.oRemoveCategoryHelpText = new EmbeddedHelpText(
    "library-remove-category",
    "Removes a Library Category for the server to put files in (Mod Command only)",
     "``<catname>`` Name of the library-category (cannot have spaces)",
     "",
     "``g!library-remove-category shoes`` (Removes the category 'shoes')"
 )
 exports.oRenameCategoryHelpText = new EmbeddedHelpText(
    "library-rename-category",
    "Renames a Library Category for the server to put files in (Mod Command only)",
     "``<oldname>`` Old name of the library-category \r\n ``<newname>`` New name for the category  (cannot have spaces)",
     "",
     "``g!library-rename-category shoes hats`` (Renames the category 'shoes' to 'hats')"
 )

exports.HandleType = {
    ADD: 1,
    DELETE: 2,
    EDIT: 3
  };

exports.AddCategory = function(client, msg)
{
    HandleLibraryCategory(client, msg, HandleType.ADD);
}

exports.RemoveCategory = function(client, msg)
{
    HandleLibraryCategory(client, msg, HandleType.DELETE);
}

exports.RenameCategory = function(client, msg)
{
    HandleLibraryCategory(client, msg, HandleType.EDIT);
}

async function HandleLibraryCategory(client, msg, iHandleType)
{
    try
    {
        var oMember = msg.member;
        if(!LibraryUtils.checkIfMod(oMember))
        {
            msg.channel.send("Sorry, you need the 'Manage Server' permission to use this command :sob: ");
            return;
        }

        var aMsgContents = msg.content.split(/\s+/);
        var cCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[1] : ""

        if(cCatName == "")
        {
            LibraryUtils.SendReplyMessage(client, msg, "Please enter a category name");
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
            Globals.Database.UpsertCustom(client, "ServerData", oKeyObject, oOptions, function(){ LibraryUtils.SendReplyMessage(client, msg, cMessage) });
        }
        else if(iHandleType == exports.HandleType.DELETE)
        {
            let aExistingFilesForCat = await  Globals.Database.dbo.collection("ServerData").aggregate([
                { $match: {
                    "guildID": oGuild.id,
                    "production": Globals.Environment.PRODUCTION
                }},
                { $unwind: "$librarycategories"},
                { $match: {
                    "librarycategories.name": cCatName,
                    "librarycategories.files.0": {$exists: true}
                }},
                ]).toArray();

            if(aExistingFilesForCat && aExistingFilesForCat.length > 0)
            {
                LibraryUtils.SendReplyMessage(client, msg, "Sorry, I can't delete a category with files already in it. Please remove the files first.")
            }
            else
            {
                oOptions = {
                    $pull: { librarycategories: {name: cCatName } }
                }
                cMessage = "Category **'" + cCatName + "'** has been removed";
                Globals.Database.UpsertCustom(client, "ServerData", oKeyObject, oOptions, function(){ LibraryUtils.SendReplyMessage(client, msg, cMessage) });
            }
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
                Globals.Database.UpsertCustom(client, "ServerData", oKeyObject, oOptions, function(){ LibraryUtils.SendReplyMessage(client, msg, cMessage) });
            }
        }

    }
    catch(err)
    {
        LibraryUtils.SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}