const Globals = require('./Globals.js')



exports.Init = function (client, msg) {

    var oAuthorUser = msg.author;
    if (oAuthorUser.id != Globals.g_GrooveID) // Groove override
    {
        var oGuildMembers = msg.guild.members;

        var oAuthorGuildMember = oGuildMembers.find(m => m.id == oAuthorUser.id);


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
    console.log(aMsgDetails);
    if (aMsgDetails.length == 1) {
        msg.channel.send(
            {
                embed:
                {
                    color: 3447003,
                    author:
                    {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
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
                        }],
                    timestamp: new Date(),
                    footer:
                    {
                        icon_url: client.user.avatarURL,
                        text: "Groovebot help"
                    }
                }
            });

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
            default:
                msg.channel.send("Sorry, but '" + cCommand + "' is not a valid option");
                break;
        }
    }
}

exports.CheckServerOptionsExist = function (client, oGuild) {
    var oKeyObject = {
        guildID: oGuild.id,
        production: Globals.bProduction
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
        production: Globals.bProduction
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
                cMessage = AddDetailsToShowOptionsMessage(client, cMessage, oResult, key)
                cMessage += "\r\n"

            }
        }
        SendReplyMessage(client, msg, cMessage);
    }
    else {
        cMessage = "**" + cOptionToQuery.toLowerCase() + "** = " + oResult[cOptionToQuery.toLowerCase()]
        cMessage = AddDetailsToShowOptionsMessage(client, cMessage, oResult, cOptionToQuery.toLowerCase())
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
        production: Globals.bProduction
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
        production: Globals.bProduction
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
        production: Globals.bProduction
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
        production: Globals.bProduction
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
        production: Globals.bProduction
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

    var oSilenceChannel = client.channels.find(c => c.id == iSilenceChannelID);

    if (!oSilenceChannel) {
        SendReplyMessage(client, msg, "Sorry, I can't find this channel")
    }
    else {
        var oKeyObject = {
            guildID: oGuild.id,
            production: Globals.bProduction
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

function SendErrorMessage(client, msg) {
    msg.channel.send("Sorry, you goofed this command. Type 'g!options' for help on option setup");
}

function SendReplyMessage(client, msg, cContent) {
    msg.channel.send(cContent);
}

function SendReplyMessageInCustomChannel(client, oChannel, cContent) {
    oChannel.send(cContent);
}

function AddDetailsToShowOptionsMessage(client, cMessage, oResult, key) {
    var oOptionType = Globals.OptionTypes[key];
    if (oOptionType && oOptionType.optiontype == "channel") {
        var oChannel = client.channels.find(c => c.id == oResult[key])
        if (oChannel)
            cMessage += " *(" + oChannel.name + ")*";
    }
    else if (oOptionType && oOptionType.optiontype == "channelarray") {
        var aChannels = oResult && oResult[key] ? oResult[key] : [];
        if (aChannels && aChannels.length > 0) {
            cMessage += " *("
            for (var i = 0; i < aChannels.length; i++) {
                var oChannel = client.channels.find(c => c.id == oResult[key][i])
                if (oChannel) {
                    if (i != 0)
                        cMessage += ", "
                    cMessage += oChannel.name;
                }
            }
            cMessage += ")*";
        }
    }

    return cMessage;
}