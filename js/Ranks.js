const Globals = require('./Globals.js');
const ErrorHandler = require('./ErrorHandler.js')

exports.HandleType = {
    ADD: 1,
    DELETE: 2,
    EDIT: 3
  };

exports.HandleCategory = function(client, msg, iHandleType)
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
                $addToSet: { rankcategories: {name: cCatName, ranks:[]} }
            }
            cMessage = "Category **'" + cCatName + "'** successfully added";
        }
        else if(iHandleType == exports.HandleType.DELETE)
        {
            oOptions = {
                $pull: { rankcategories: {name: cCatName } }
            }
            cMessage = "Category **'" + cCatName + "'** has been removed";
        }
        else if(iHandleType == exports.HandleType.EDIT)
        {
            let cNewCatName = aMsgContents && aMsgContents.length > 1 ? aMsgContents[2] : "";
            oKeyObject["rankcategories.name"] = cCatName
            if(cNewCatName)
            {
                oOptions = {
                    $set: { "rankcategories.$.name": cNewCatName}
                }
                cMessage = "Category '**" + cCatName + "**' has been renamed to '**" + cNewCatName + "**'";
            }
        }

        Globals.Database.UpsertCustom(client, "ServerData", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));
    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

exports.HandleCategoryRank = function(client, msg, iHandleType)
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
            oRole = oGuild.roles.find(r => r.id == cRoleName);
            if(!oRole)
            {
                SendReplyMessage(client, msg, `Sorry, I can't find the role ${cRoleName} in this server`);
                return;
            }
        }

        var iRoleID = oRole.id;
        cRoleName = oRole.name;

        let oKeyObject = {
            "guildID": oGuild.id,
            "production": Globals.Environment.PRODUCTION,
            "rankcategories.name": cCatName
        }

        let oOptions = {};
        let cMessage = "Uh oh, there may have been an error..."
        if(iHandleType == 1)
        {
            oOptions = {
                $addToSet: { "rankcategories.$.ranks": iRoleID }
            }
            cMessage = `Role **'${oRole.name}'** successfully added to category **'${cCatName}'**`;
        }
        else if(iHandleType == 2)
        {
            oOptions = {
                $pull: { "rankcategories.$.ranks": iRoleID }
            }
            cMessage = `Role **'${oRole.name}'** has been removed from category **'${cCatName}'**`;
        }


        Globals.Database.UpsertCustom(client, "ServerData", oKeyObject, oOptions, SendReplyMessage(client, msg, cMessage));
    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}

exports.ShowCategorysRanks = function(client, msg)
{
    try
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
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
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
        projection: { "rankcategories":1, _id:0 }
    }

    var aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
    { $match: {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION,
    }},
    { $unwind: "$rankcategories"},
    { $sort : { "rankcategories.name" : 1 } },
    { $project: {
            name: "$rankcategories.name",
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
        msg.channel.send(cReturn)
    }

}

async function ShowRanks(client, msg, cCatName)
{
    let oGuild = msg.guild;

    var aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
    { $match: {
        "guildID": oGuild.id,
        "production": Globals.Environment.PRODUCTION
    }},
    { $unwind: "$rankcategories"},
    { $match: {
        "rankcategories.name": cCatName
        }
    },
    { $project: {
            ranks: "$rankcategories.ranks",
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
        let aRankNames = [];
        var cReturn = "**LIST OF RANKS FOR CATEGORY: " + cCatName.toUpperCase() + "** \r\n```\r\n";
        for(var i = 0; i < aRanks.length; i++)
        {
            oRole = oGuild.roles.find(r => r.id == aRanks[i]);
            if(oRole)
            {
                aRankNames.push(oRole.name);
            }
        }
        if(aRankNames.length == 0)
            cReturn += " ";
        else
        {
            aRankNames.sort();
            cReturn += aRankNames.join("\r\n")
        }
        cReturn += "```"
        msg.channel.send(cReturn)
    }

}

exports.PrintRanks = async function(client, msg)
{
    try
    {
        let oGuild = msg.guild;

        var aResult = await Globals.Database.dbo.collection("ServerData").aggregate([
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
            var oCategories = oResult.rankcategories;
            if(!oCategories || oCategories.length == 0)
            {
                msg.channel.send("Sorry I can't find any ranks or categories for this server")
                return;
            }
            else
            {
                oCategories.sort((a,b) => a.name > b.name);
                var aReturnString = [];
                var cReturn = "**__LIST OF RANKS AND CATEGORIES__** \r\n\r\n";
                for(var i = 0; i < oCategories.length; i++)
                {
                    let oCategory = oCategories[i];
                    cReturn += `**${oCategory.name}**\r\n\`\`\`\r\n` ;
                    let aRankNames = [];
                    for(var j = 0; j < oCategory.ranks.length; j++)
                    {
                        let iRank = oCategory.ranks[j];
                        let oRole = oGuild.roles.find(r => r.id == iRank);
                        let cRoleName = oRole.name;
                        aRankNames.push(cRoleName)
                    }
                    if(aRankNames.length == 0)
                        cReturn += " ";
                    else
                    {
                        aRankNames.sort();
                        cReturn += aRankNames.join("\r\n")
                    }
                    cReturn += "```";
                    if(cReturn.length > 1000)
                    {
                        aReturnString.push(cReturn)
                        cReturn = ""
                    }
                }
                aReturnString.push(cReturn);
                for(var i = 0; i < aReturnString.length; i++)
                {
                    if(aReturnString[i] != "")
                    msg.channel.send(aReturnString[i])
                }
            }
        }
    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Uh oh, there may have been an error...");
        ErrorHandler.HandleError(client, err)
    }
}


exports.ToggleUserRank = async function(client, msg)
{
    try
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

        var aResult = await Globals.Database.dbo.collection("ServerData").find(
            {
                "guildID": oGuild.id,
                "production": Globals.Environment.PRODUCTION,
                "rankcategories.ranks": { $in: [ iRoleID ] }
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
                await oMember.removeRole(iRoleID)
                cMessage = "I've removed the role **" + cRankName + "** from you";
            }
            else
            {
                await oMember.addRole(iRoleID)
                cMessage = "I've added the role **" + cRankName + "** for you";
            }
            SendReplyMessage(client, msg, cMessage);
        }
    }
    catch(err)
    {
        SendReplyMessage(client, msg, "Sorry, I'm not able to handle that rank...");
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