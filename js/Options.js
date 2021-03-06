const Globals = require('./Globals.js')
const Discord = require('discord.js');
const PaginationMessage = require("./Classes/PaginationMessage.js");
const PaginationButton = require("./Classes/PaginationButton.js");
let oHelpText = {};


exports.Init = async function (client, msg) {

    var oAuthorUser = msg.author;
    if (oAuthorUser.id != Globals.g_GrooveID) // Groove override
    {
        var oGuildMembers = msg.guild.members;

        var oAuthorGuildMember = oGuildmembers.cache.find(m => m.id == oAuthorUser.id);


        if (!oAuthorGuildMember) {
            console.log("the fuck, where's the user?");
            return;
        }
        else {
            if (!oAuthorGuildMember.hasPermission('MANAGE_GUILD')) {
                SendReplyMessage(client, msg, "Sorry, you need the 'Manage Server' permission to use this command :sob: ")
                return;
            }
        }
    }

    exports.CheckServerOptionsExist(client, msg.guild);

    var aMsgDetails = msg.content.split(" ").filter(function (el) {
        return el != null && el.length > 0;
    });

    if (aMsgDetails.length == 1) {
        let oListMessage = await printOptionsList(msg.channel, 1);
        let oPagMessage = new PaginationMessage();
        oPagMessage.addButton(new PaginationButton("◀", function(){editOptionsList(oListMessage, -1)}, 1));
        oPagMessage.addButton(new PaginationButton('▶', function(){editOptionsList(oListMessage, 1)}, 2));
        oPagMessage.oMessage = oListMessage
        await oPagMessage.Init();
        //msg.channel.send({embed: oHelpText.oEmbedText});
    }
    else {
        var cCommand = aMsgDetails[1];
        switch (cCommand.toLowerCase()) {
            case "show":
                ShowOption(client, msg, aMsgDetails);
                break;
            case "togglechannelcopy":
                ToggleChannelCopy(client, msg, aMsgDetails);
                break;
            case "copyinputchannel":
                SetCopyInputChannel(client, msg, aMsgDetails);
                break;
            case "copyoutputchannel":
                SetCopyOutputChannel(client, msg, aMsgDetails)
                break;
            case "toggleouija":
                ToggleOuija(client, msg, aMsgDetails);
                break;
            case "ouijachannel":
                SetOuijaChannel(client, msg, aMsgDetails)
                break;
            case "togglesilencechannel":
                ToggleSilenceChannel(client, msg, aMsgDetails)
                break;
            case "toggleaddroleoninvite":
                ToggleAddRoleOnInvite(client, msg, aMsgDetails)
                break;
            case "toggleaddroleonapprove":
                ToggleAddRoleOnApprove(client, msg, aMsgDetails)
                break;
            case "toggleremoveroleonapprove":
                ToggleRemoveRoleOnApprove(client, msg, aMsgDetails)
                break;
            case "pinboardchannel":
                SetPinboardChannel(client, msg, aMsgDetails)
                break;
            case "starboardchannel":
                SetStarboardChannel(client, msg, aMsgDetails)
                break;
            case "starboardthreshold":
                SetStarboardThreshold(client, msg, aMsgDetails)
                break;
            case "messageonapprovestring":
                SetMessageOnApproveString(client, msg, aMsgDetails)
                break;
            case "messageonapprovechannel":
                SetMessageOnApproveChannel(client, msg, aMsgDetails)
                break;
            case "feedbackchannel":
                SetFeedbackChannel(client, msg, aMsgDetails);
                break;
            default:
                msg.channel.send("Sorry, but '" + cCommand + "' is not a valid option");
                break;
        }
    }
}

async function editOptionsList(oMessage, iDirection)
{
  let oEmbed = oMessage.embeds[0];
  if(oEmbed)
  {
    let aPageData = oEmbed.description ? oEmbed.description.substring(5).split("/") : null
    if(aPageData)
    {
      let iCurrentPage = parseInt(aPageData[0]);
      let iTotalPages = parseInt(aPageData[1]);
      if(!Number.isInteger(iCurrentPage) || !Number.isInteger(iCurrentPage))
        return;
      if(iCurrentPage >= iTotalPages && iDirection == 1)
        return;
      if(iCurrentPage <= 1 && iDirection == -1)
        return

      await printOptionsList(oMessage.channel, iCurrentPage + iDirection, oMessage)
    }
  }
}

async function printOptionsList(oChannel, iPage, oMessage)
{
    let iRanksPerPage = 5;
    iPage = Math.max(1, iPage);
    let aFields = oHelpText.oEmbedText.fields.slice((iPage-1)*iRanksPerPage, (iPage)*iRanksPerPage);

    let oEmbed = new Discord.MessageEmbed()
                    .setColor('#c0ff28')
                    .setTitle('Options List')
                    .setDescription(`Page ${iPage}/${Math.ceil(oHelpText.oEmbedText.fields.length/iRanksPerPage)}`);
    for(let i = 0; i < iRanksPerPage; i++)
    {
        let oItem = aFields[i];
        if(oItem)
            oEmbed.addField(oItem.name, oItem.value);
    }


    if(oMessage)
      return await oMessage.edit(oEmbed)
    else
      return await oChannel.send(oEmbed);
}

exports.CheckServerOptionsExist = function (client, oGuild) {
    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        guildName: oGuild.name,
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject);
}

async function ShowOption(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2]) {
        SendErrorMessage(client, msg)
        return;
    }

    var cOptionToQuery = aMsgDetails[2];

    var oGuild = msg.guild;

    var oQueryObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }

    var aResult = await Globals.Database.Query("ServerOptions", oQueryObject)
    console.log(aResult)
    var oResult = aResult.length > 0 ? aResult[0] : null
    if (!oResult) {
        SendReplyMessage(client, msg, "Sorry, something went wrong (try again though, maybe this was your first time setting up options and I couldn't find anything) ");
        return;
    }
    var cMessage = "";
    var aDontShowProps = ["_id", "production"];
    if (cOptionToQuery.toLowerCase() == "all") {
        for (var key in oResult) {
            if (oResult.hasOwnProperty(key) && aDontShowProps.indexOf(key.toLowerCase()) == -1) {
                cMessage += "**" + key.toLowerCase() + "** = " + oResult[key]
                cMessage = AddDetailsToShowOptionsMessage(client, oGuild, cMessage, oResult, key)
                cMessage += "\r\n"

            }
        }
        SendReplyMessage(client, msg, cMessage);
    }
    else {
        cMessage = "**" + cOptionToQuery.toLowerCase() + "** = " + oResult[cOptionToQuery.toLowerCase()]
        cMessage = AddDetailsToShowOptionsMessage(client, oGuild, cMessage, oResult, cOptionToQuery.toLowerCase())
        SendReplyMessage(client, msg, cMessage);
    }
}

function ToggleChannelCopy(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || (aMsgDetails[2].toLowerCase() != "on" && aMsgDetails[2].toLowerCase() != "off")) {
        SendErrorMessage(client, msg)
        return;
    }
    var bUseChannelCopy = aMsgDetails[2].toLowerCase() == "on";
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        togglechannelcopy: bUseChannelCopy
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "ToggleChannelCopy successfully updated to " + aMsgDetails[2].toLowerCase()));
}

function SetCopyInputChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iCopyInputChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        copyinputchannel: iCopyInputChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "CopyInputChannel successfully updated to " + iCopyInputChannel));
}

function SetCopyOutputChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iCopyOutputChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        copyoutputchannel: iCopyOutputChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "CopyOutputChannel successfully updated to " + iCopyOutputChannel));
}

function ToggleOuija(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || (aMsgDetails[2].toLowerCase() != "on" && aMsgDetails[2].toLowerCase() != "off")) {
        SendErrorMessage(client, msg)
        return;
    }
    var bUseOuija = aMsgDetails[2].toLowerCase() == "on";
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        toggleouija: bUseOuija
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "ToggleOuija successfully updated to " + aMsgDetails[2].toLowerCase()));
}

function SetOuijaChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iOuijaChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        ouijachannel: iOuijaChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "OuijaChannel successfully updated to " + iOuijaChannel));
}

function ToggleSilenceChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 4 || !aMsgDetails[2] || !parseInt(aMsgDetails[2]) || !aMsgDetails[3]) {
        SendErrorMessage(client, msg)
        return;
    }
    var iSilenceChannelID = aMsgDetails[2]
    var bAddSilenceChannel = aMsgDetails[3].toLowerCase() == "on";
    var oGuild = msg.guild;

    var oSilenceChannel = client.channels.cache.find(c => c.id == iSilenceChannelID);

    if (!oSilenceChannel) {
        SendReplyMessage(client, msg, "Sorry, I can't find this channel")
    }
    else {
        var oKeyObject = {
            guildID: oGuild.id,
            production: Globals.Environment.PRODUCTION
        }
        var oInsertObject = {};
        var cMessage = "";
        if (bAddSilenceChannel) {
            oInsertObject = {
                $addToSet: { "silencechannels": iSilenceChannelID }
            };
            cMessage = "Silence Mode has been activated. All messages in this " + oSilenceChannel.name + " will be auto-deleted until this is toggled off :sob:";
        }
        else {
            oInsertObject = {
                $pull: { "silencechannels": iSilenceChannelID }
            };
            cMessage = "Silence Mode has been de-activated for " + oSilenceChannel.name + ". Messages are no longer auto-deleted :smile:";
        }


        Globals.Database.UpsertManual("ServerOptions", oKeyObject, oInsertObject, SendReplyMessageInCustomChannel(client, oSilenceChannel, cMessage));
        if (oSilenceChannel.id != msg.channel.id)
            SendReplyMessage(client, msg, cMessage)
    }
}

function ToggleAddRoleOnInvite(client, msg, aMsgDetails) {

    var cRole = aMsgDetails.filter((val, index) => index > 1 && index < aMsgDetails.length -1).join(" ")
    var bOn = aMsgDetails[aMsgDetails.length -1].toLowerCase() == "on";
    var oGuild = msg.guild;

    var oRole = Globals.GetRoleByInput(oGuild, cRole);

    if (!oRole) {
        SendReplyMessage(client, msg, "Sorry, I can't find this role")
    }
    else {
        var oKeyObject = {
            guildID: oGuild.id,
            production: Globals.Environment.PRODUCTION
        }
        var oInsertObject = {};
        var cMessage = "";
        if (bOn) {
            oInsertObject = {
                $addToSet: { "addroleoninvite": oRole.id }
            };
            cMessage = `**${oRole.name}** will now be added to members upon invite`;
        }
        else {
            oInsertObject = {
                $pull: { "addroleoninvite": oRole.id }
            };
            cMessage = cMessage = `**${oRole.name}** will NO LONGER be added to members upon invite`;
        }

        Globals.Database.UpsertManual("ServerOptions", oKeyObject, oInsertObject, SendReplyMessageInCustomChannel(client, msg.channel, cMessage));
    }
}

function ToggleAddRoleOnApprove(client, msg, aMsgDetails) {

    var cRole = aMsgDetails.filter((val, index) => index > 1 && index < aMsgDetails.length -1).join(" ")
    var bOn = aMsgDetails[aMsgDetails.length -1].toLowerCase() == "on";
    var oGuild = msg.guild;

    var oRole = Globals.GetRoleByInput(oGuild, cRole);

    if (!oRole) {
        SendReplyMessage(client, msg, "Sorry, I can't find this role")
    }
    else {
        var oKeyObject = {
            guildID: oGuild.id,
            production: Globals.Environment.PRODUCTION
        }
        var oInsertObject = {};
        var cMessage = "";
        if (bOn) {
            oInsertObject = {
                $addToSet: { "addroleonapprove": oRole.id }
            };
            cMessage = `**${oRole.name}** will now be added to members upon approval`;
        }
        else {
            oInsertObject = {
                $pull: { "addroleonapprove": oRole.id }
            };
            cMessage = cMessage = `**${oRole.name}** will NO LONGER be added to members upon approval`;
        }

        Globals.Database.UpsertManual("ServerOptions", oKeyObject, oInsertObject, SendReplyMessageInCustomChannel(client, msg.channel, cMessage));
    }
}

function ToggleRemoveRoleOnApprove(client, msg, aMsgDetails) {

    var cRole = aMsgDetails.filter((val, index) => index > 1 && index < aMsgDetails.length -1).join(" ")
    var bOn = aMsgDetails[aMsgDetails.length -1].toLowerCase() == "on";
    var oGuild = msg.guild;

    var oRole = Globals.GetRoleByInput(oGuild, cRole);

    if (!oRole) {
        SendReplyMessage(client, msg, "Sorry, I can't find this role")
    }
    else {
        var oKeyObject = {
            guildID: oGuild.id,
            production: Globals.Environment.PRODUCTION
        }
        var oInsertObject = {};
        var cMessage = "";
        if (bOn) {
            oInsertObject = {
                $addToSet: { "removeroleonapprove": oRole.id }
            };
            cMessage = `**${oRole.name}** will now be removed from members upon approval`;
        }
        else {
            oInsertObject = {
                $pull: { "removeroleonapprove": oRole.id }
            };
            cMessage = cMessage = `**${oRole.name}** will NO LONGER be removed from members upon approval`;
        }

        Globals.Database.UpsertManual("ServerOptions", oKeyObject, oInsertObject, SendReplyMessageInCustomChannel(client, msg.channel, cMessage));
    }
}

function SetPinboardChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iPinboardChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        pinboardchannel: iPinboardChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "PinboardChannel successfully updated to " + iPinboardChannel));
}

function SetStarboardChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iStarboardChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        starboardchannel: iStarboardChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "StarboardChannel successfully updated to " + iStarboardChannel));
}

function SetStarboardThreshold(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iStarboardThreshold = aMsgDetails[2]
    var oGuild = msg.guild;

    if (!parseInt(iStarboardThreshold) || parseInt(iStarboardThreshold) < 0) {
        SendReplyMessage(client, msg, "Sorry, threshold has to be greater than 0")
    }

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        starboardthreshold: iStarboardThreshold
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "StarboardThreshold successfully updated to " + iStarboardThreshold));
}

function SetMessageOnApproveString(client, msg, aMsgDetails) {
    let cString = aMsgDetails.filter((e, index) => index >=2).join(" ");
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        messageonapprovestring: cString
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "MessageOnApproveString successfully updated to " + cString));
}

function SetMessageOnApproveChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iMessageChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        messageonapprovechannel: iMessageChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "MessageOnApproveChannel successfully updated to " + iMessageChannel));
}

function SetFeedbackChannel(client, msg, aMsgDetails) {
    if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2])) {
        SendErrorMessage(client, msg)
        return;
    }
    var iFeedbackChannel = aMsgDetails[2]
    var oGuild = msg.guild;

    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = {
        feedbackchannel: iFeedbackChannel
    };

    Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "FeedbackChannel successfully updated to " + iFeedbackChannel));
}


////////////////////

function SendErrorMessage(client, msg) {
    msg.channel.send("Sorry, you goofed this command. Type 'g!options' for help on option setup");
}

function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}

function SendReplyMessageInCustomChannel(client, oChannel, cContent) {
    oChannel.send(cContent);
}

function AddDetailsToShowOptionsMessage(client, oGuild, cMessage, oResult, key) {
    var oOptionType = Globals.OptionTypes[key];
    if (oOptionType && oOptionType.optiontype == "channel") {
        var oChannel = client.channels.cache.find(c => c.id == oResult[key])
        if (oChannel)
            cMessage += " *(" + oChannel.name + ")*";
    }
    else if (oOptionType && oOptionType.optiontype == "channelarray") {
        var aChannels = oResult && oResult[key] ? oResult[key] : [];
        if (aChannels && aChannels.length > 0) {
            cMessage += " *("
            for (var i = 0; i < aChannels.length; i++) {
                var oChannel = client.channels.cache.find(c => c.id == oResult[key][i])
                if (oChannel) {
                    if (i != 0)
                        cMessage += ", "
                    cMessage += oChannel.name;
                }
            }
            cMessage += ")*";
        }
    }
    else if (oOptionType && oOptionType.optiontype == "rolearray") {
        var aRoles = oResult && oResult[key] ? oResult[key] : [];
        if (aRoles && aRoles.length > 0) {
            cMessage += " *("
            for (var i = 0; i < aRoles.length; i++) {
                var oRole = oGuild.roles.cache.find(r => r.id == oResult[key][i])
                if (oRole) {
                    if (i != 0)
                        cMessage += ", "
                    cMessage += oRole.name;
                }
            }
            cMessage += ")*";
        }
    }
    else if (oOptionType && oOptionType.optiontype == "emojiarray") {
        var aEmojis = oResult && oResult[key] ? oResult[key] : [];
        if (aEmojis && aEmojis.length > 0) {
            cMessage += " *("
            for (var i = 0; i < aEmojis.length; i++) {
                var oEmoji = oGuild.emojis.cache.find(r => r.id == oResult[key][i])
                if (oEmoji) {
                    if (i != 0)
                        cMessage += ", "
                    cMessage += `${oEmoji}`;
                }
            }
            cMessage += ")*";
        }
    }

    return cMessage;
}

exports.Onload = function()
{
    oHelpText = {
        oEmbedText: {

            color: 3447003,
            author:
            {
                name: Globals.g_Client.user.username,
                icon_url: Globals.g_Client.user.displayAvatarURL({size:1024, format: "png"})
            },
            title: "Options List",
            description: "Here's a list of options that you can set on your server (case insensitive)",
            fields: [
                {
                    name: "g!options Show <option>/'all'",
                    value: "Returns the value of any option type (if already set), or type 'all' to retun all option values (if set)"
                },
                {
                    name: "g!options **ToggleChannelCopy** <on/off>",
                    value: "Turn on or off the Copy functionality (type 'on' or 'off' without the quotes)"
                },
                {
                    name: "g!options **CopyInputChannel** <channelid>",
                    value: "Sets the channel that you want to copy FROM"
                },
                {
                    name: "g!options **CopyOutputChannel** <channelid>",
                    value: "Sets the channel that you want to copy TO"
                },
                {
                    name: "g!options **ToggleOuija** <on/off>",
                    value: "Turn on or off the Ouija functionality (type 'on' or 'off' without the quotes)"
                },
                {
                    name: "g!options **OuijaChannel** <channelid>",
                    value: "Sets the channel that you want to have Groovebot listen to for AskOuija"
                },
                {
                    name: "g!options **ToggleSilenceChannel** <channelid> <on/off>",
                    value: "Toggle Auto-delete all incoming messages from channel (except for g!options commands)"
                },
                {
                    name: "g!options **ToggleAddRoleOnInvite** <role> <on/off>",
                    value: "Toggle which role(s) is added to new members on invite to server"
                },
                {
                    name: "g!options **ToggleAddRoleOnApprove** <role> <on/off>",
                    value: "Toggle which role(s) is added to new members on approval to server"
                },
                {
                    name: "g!options **ToggleRemoveRoleOnApprove** <role> <on/off>",
                    value: "Toggle which role(s) is removed from new members on approval to server"
                },
                {
                    name: "g!options **PinboardChannel** <channelid>",
                    value: "Sets the channel for Pinboard"
                },
                {
                    name: "g!options **StarboardChannel** <channelid>",
                    value: "Sets the channel for Starboard"
                },
                {
                    name: "g!options **StarboardThreshold** <number>",
                    value: "Toggles how many stars is needed for Starboard (defaults to 5)"
                },
                {
                    name: "g!options **MessageOnApproveString** <number>",
                    value: "Sets the welcome message after approval. Use ``" + Globals.UserTagReplace + "`` as string for the user mention"
                },
                {
                    name: "g!options **MessageOnApproveChannel** <number>",
                    value: "Sets the channel for the Welcome Message after approve"
                },
                {
                    name: "g!options **FeedbackChannel** <channelid>",
                    value: "Sets the channel for server feedback"
                }],
            timestamp: new Date(),
            footer:
            {
                icon_url: Globals.g_Client.user.displayAvatarURL({size:1024, format: "png"}),
                text: "Groovebot help"
            }

        }
    }
    oHelpText.oEmbedText.fields.sort((a,b) => {return a.name > b.name ? 1 : -1;});
    exports.oHelpText = oHelpText;
}
exports.oHelpText = oHelpText;