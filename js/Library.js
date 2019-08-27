const Globals = require('./Globals.js');
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
                $addToSet: { librarycategories: {name: cCatName, ranks:[]} }
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

exports.HandleLibraryFile = function(client, msg, iHandleType)
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
        var cRoleName = aMsgContents && aMsgContents.length > 2 ? aMsgContents.slice(2).join(" ") : ""

        // if(cCatName == "")
        // {
        //     SendReplyMessage(client, msg, "Please enter a category name");
        //     return;
        // }
        // if(cRoleName == "")
        // {
        //     SendReplyMessage(client, msg, "Please enter a role name");
        //     return;
        // }

        let oGuild = msg.guild;

        for (let [k, v] of msg.attachments) {
    console.log("Key: " + k);
    console.log("Value: " + v.url);
}
    //     var oRole = oGuild.roles.find(r => r.name == cRoleName);
    //     if(!oRole)
    //     {
    //         oRole = oGuild.roles.find(r => r.id == cRoleName);
    //         if(!oRole)
    //         {
    //             SendReplyMessage(client, msg, `Sorry, I can't find the role ${cRoleName} in this server`);
    //             return;
    //         }
    //     }

    //     var iRoleID = oRole.id;
    //     cRoleName = oRole.name;

    //     let oKeyObject = {
    //         "guildID": oGuild.id,
    //         "production": Globals.Environment.PRODUCTION,
    //         "rankcategories.name": cCatName
    //     }

    //     let oOptions = {};
    //     let cMessage = "Uh oh, there may have been an error..."
    //     if(iHandleType == 1)
    //     {
    //         oOptions = {
    //             $addToSet: { "rankcategories.$.ranks": iRoleID }
    //         }
    //         cMessage = `Role **'${oRole.name}'** successfully added to category **'${cCatName}'**`;
    //     }
    //     else if(iHandleType == 2)
    //     {
    //         oOptions = {
    //             $pull: { "rankcategories.$.ranks": iRoleID }
    //         }
    //         cMessage = `Role **'${oRole.name}'** has been removed from category **'${cCatName}'**`;
    //     }


    //     Globals.Database.UpsertCustom("ServerData", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));
    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

function checkIfMod(member)
{
    return member && member.hasPermission('MANAGE_GUILD');
}

function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}