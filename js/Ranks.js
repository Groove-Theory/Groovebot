var Globals = require('./Globals.js');

exports.HandleType = {
    ADD: 1,
    DELETE: 2,
    EDIT: 3
  };

exports.HandleCategory = function(client, msg, iHandleType)
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
            $addToSet: { categories: {name: cCatName, ranks:[]} } 
        }
        cMessage = "Category '" + cCatName + "' successfully added";
    }
    else if(iHandleType == exports.HandleType.DELETE)
    {
        oOptions = {
            $pull: { categories: {name: cCatName } }
        }
        cMessage = "Category '" + cCatName + "' has been removed";
    }
    else if(iHandleType == exports.HandleType.EDIT)
    {
        let cNewCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[2] : "";
        if(cNewCatName)
        {
            oOptions = {
                $rename: { cCatName: cNewCatName}
            }
            cMessage = "Category '" + cCatName + "' has been renamed to '" + cNewCatName + "'";
        }
    }

    Globals.Database.UpsertCustom("Ranks", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));

}

exports.HandleCategoryRank = function(client, msg, iHandleType)
{
    var oMember = msg.member;
    if(!checkIfMod(oMember))
    {
        msg.channel.send("Sorry, you need the 'Manage Server' permission to use this command :sob: ");
        return;
    }

    var aMsgContents = msg.content.split(/\s+/); 
    var cCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[1] : ""
    var cRoleName = aMsgContents && aMsgContents.length > 2 ? aMsgContents[2] : ""

    if(cCatName == "")
    {
        SendReplyMessage(client, msg, "Please enter a category name");
        return;
    }
    if(cRoleName == "")
    {
        SendReplyMessage(client, msg, "Please enter a role name");
        return;
    }

    let oGuild = msg.guild;
    var oRole = oGuild.roles.find("name", cRoleName);
    if(!oRole)
    {
        oRole = guild.roles.find("id", cRoleName);
        if(!oRole)
        {
            SendReplyMessage(client, msg, "Sorry, I can't rind that role in this server");
            return;
        }
    }

    var iRoleID = oRole.id;
    cRoleName = oRole.name;

    let oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION,
    }

    let oOptions = {};
    let cMessage = "Uh oh, there may have been an error..."
    if(iHandleType == 1)
    {
        let cCatIdentifier = "playlists.$[]." + cCatName;
        oOptions = {
            $addToSet: { categories: {name: cCatName, ranks: {iRoleID}} } 
        }       
        cMessage = `Role '${oRole.name}' successfully added to Category '${cCatName}`;
    }
    else if(iHandleType == 2)
    {
        oOptions = {
            $pull: { ranks: iRoleID } 
        }
        cMessage = `Role '${oRole.name}' has been removed from Category '${cCatName}`;
    }


    Globals.Database.UpsertCustom("Ranks", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));

}



exports.RemoveCategory = function(client, msg)
{
  var length = getRandIntFromR
}

function checkIfMod(member)
{
    return member && member.hasPermission('MANAGE_GUILD');
}

function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}

function SendReplyMessageInCustomChannel(client, oChannel, cContent) {
    oChannel.send(cContent);
}