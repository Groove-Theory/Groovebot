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
        cMessage = "Category **'" + cCatName + "'** successfully added";
    }
    else if(iHandleType == exports.HandleType.DELETE)
    {
        oOptions = {
            $pull: { categories: {name: cCatName } }
        }
        cMessage = "Category **'" + cCatName + "'** has been removed";
    }
    else if(iHandleType == exports.HandleType.EDIT)
    {
        let cNewCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[2] : "";
        if(cNewCatName)
        {
            oOptions = {
                $set: { "categories.name": cNewCatName}
            }
            cMessage = "Category '**" + cCatName + "**' has been renamed to '**" + cNewCatName + "**'";
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
    var oRole = oGuild.roles.find(r => r.name == cRoleName);
    if(!oRole)
    {
        oRole = guild.roles.find(r => r.id == cRoleName);
        if(!oRole)
        {
            SendReplyMessage(client, msg, "Sorry, I can't rind that role in this server");
            return;
        }
    }

    var iRoleID = oRole.id;
    cRoleName = oRole.name;

    let oKeyObject = {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
        "categories.name": cCatName
    }

    let oOptions = {};
    let cMessage = "Uh oh, there may have been an error..."
    if(iHandleType == 1)
    {
        let cCatIdentifier = "playlists.$[]." + cCatName;
        oOptions = {
            $addToSet: { "categories.$.ranks": iRoleID }
        }
        cMessage = `Role **'${oRole.name}'** successfully added to category **'${cCatName}'**`;
    }
    else if(iHandleType == 2)
    {
        oOptions = {
            $pull: { "categories.$.ranks": iRoleID }
        }
        cMessage = `Role **'${oRole.name}'** has been removed from category **'${cCatName}'**`;
    }


    Globals.Database.UpsertCustom("Ranks", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));

}

exports.ShowCategorysRanks = function(client, msg)
{
    var aMsgContents = msg.content.split(/\s+/);
    var cCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[1] : ""

    var iMode = cCatName == "" ? 1 : 2; //1 = Categories, 2 = Ranks for a Category
    if(iMode == 1)
    {
        ShowCategories(client, msg)
    }
    else if(iMode == 2)
    {
        ShowRanks(client, msg, cCatName)
    }
}

async function ShowCategories(client, msg)
{
    let oGuild = msg.guild;

    let oKeyObject = {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
    }
    let oReturn = {
        projection: { "categories":1, _id:0 }
    }

    var aResult = await Globals.Database.dbo.collection("Ranks").aggregate([
    { $match: {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
    }},
    { $unwind: "$categories"},
    { $project: {
            name: "$categories.name",
            _id: 0
        }},
    ]).toArray();
    if (!aResult || aResult.length == 0) {
        msg.channel.send("Sorry I can't find any categories for this server")
        return;
    }
    else
    {
        var cReturn = "**LIST OF RANK CATEGORIES** \r\n```\r\n";
        for(var i = 0; i < aResult.length; i++)
        {
            cReturn += aResult[i].name + "\r\n";
        }
        cReturn += "```"
        console.log(cReturn);
        msg.channel.send(cReturn)
    }

}

async function ShowRanks(client, msg, cCatName)
{
    let oGuild = msg.guild;

    var aResult = await Globals.Database.dbo.collection("Ranks").aggregate([
    { $match: {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION
    }},
    { $unwind: "$categories"},
    { $match: {
        "categories.name": cCatName
        }
    },
    { $project: {
            ranks: "$categories.ranks",
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
        let aRanks = oResult.ranks;
        var cReturn = "**LIST OF RANKS FOR CATEGORY: " + cCatName.toUpperCase() + "** \r\n```\r\n";
        for(var i = 0; i < aRanks.length; i++)
        {
            console.log(aRanks[i])
            oRole = oGuild.roles.find(r => r.id == aRanks[i]);
            if(oRole)
            {
                cReturn += oRole.name + "\r\n";
            }
        }
        cReturn += "```"
        console.log(cReturn);
        msg.channel.send(cReturn)
    }

}

exports.PrintRanks = async function(client, msg)
{
    let oGuild = msg.guild;

    var aResult = await Globals.Database.dbo.collection("Ranks").aggregate([
    { $match: {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
    }},
    ]).toArray();
    if (!aResult || aResult.length == 0) {
        msg.channel.send("Sorry I can't find any ranks or categories for this server")
        return;
    }
    else
    {
        var oResult = aResult[0];
        var oCategories = oResult.categories;
        var cReturn = "**__LIST OF RANKS AND CATEGORIES__** \r\n\r\n";
        for(var i = 0; i < oCategories.length; i++)
        {
            let oCategory = oCategories[i];
            cReturn += `**${oCategory.name}**\r\n\`\`\`\r\n` ;
            for(var j = 0; j < oCategory.ranks.length; j++)
            {
                let iRank = oCategory.ranks[j];
                let oRole = oGuild.roles.find(r => r.id == iRank);
                let cRoleName = oRole.name;
                cReturn += `${cRoleName}\r\n`
            }
            cReturn += "```";
        }
        console.log(cReturn);
        msg.channel.send(cReturn)
    }

}


exports.ToggleUserRank = async function(client, msg)
{
    var oMember = msg.member;

    var aMsgContents = msg.content.split(/\s+/);
    var cRankName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[1] : ""

    if(cRankName == "")
    {
        SendReplyMessage(client, msg, "Please enter a rank name");
        return;
    }

    let oGuild = msg.guild;
    var oRole = oGuild.roles.find(r => r.name == cRankName);
    if(!oRole)
    {
        SendReplyMessage(client, msg, "Sorry, I can't rind that rank");
        return;
    }

    var iRoleID = oRole.id;
    cRankName = oRole.name;

    var aResult = await Globals.Database.dbo.collection("Ranks").find(
        {
            "guildID": oGuild.id,
            "production": Globals.Environment.PRODUCTION,
            "categories.ranks": { $in: [ iRoleID ] }
        }
    ).toArray();
    let bRankFound = aResult && aResult.length > 0;
    if(!bRankFound)
    {
        SendReplyMessage(client, msg, "Sorry, I can't rind that rank");
        return;
    }
    else
    {
        var bHasRoleAlready = oMember.roles.find(r => r.id == iRoleID);
        let cMessage = "Uh oh, there's been an error..."
        if(bHasRoleAlready)
        {
            oMember.removeRole(iRoleID)
            cMessage = "I've removed the role **" + cRankName + "** from you";
        }
        else
        {
            oMember.addRole(iRoleID)
            cMessage = "I've added the role **" + cRankName + "** for you";
        }
        SendReplyMessage(client, msg, cMessage);
    }
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