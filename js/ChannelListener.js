const Globals = require('./Globals.js');
const ErrorHandler = require('./ErrorHandler.js')
const FoyerCopy = require('./FoyerCopy.js')
const Ouija = require('./Ouija.js')
const CommandListener = require('./CommandListener.js')
const Ventriloquist = require('./Ventriloquist.js')
const SilenceChannel = require('./SilenceChannel.js')
const Approve = require('./Approve.js')
const Ranks = require('./Ranks.js')

exports.Init = function (client) {
    client.on('message', async msg => {
        try {
            var iMsgChannelID = msg.channel.id;
            var oGuild = msg.guild;
            if (!oGuild)
                return;

            var oQueryObject = {
                guildID: oGuild.id,
                production: Globals.Environment.PRODUCTION
            }

            let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);
            var oResult = aResult.length > 0 ? aResult[0] : null;
            if (!oResult) {
                Options.CheckServerOptionsExist(client, oGuild)
                msg.channel.send("Sorry just had a bit of a hiccup, can you try again please?")
                return;
            }

            var aSilenceChannelIDs = oResult["silencechannels"];
            var bSilenced = SilenceChannel.ProcessMessage(client, msg, aSilenceChannelIDs);

            if (!bSilenced) {
                var iCopyInputChannelID = oResult["copyinputchannel"];
                var iCopyOutputChannelID = oResult["copyoutputchannel"];
                var bToggleChannelCopy = oResult["togglechannelcopy"];
                FoyerCopy.OnMessage(client, msg, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);

                var iOuijaChannelID = oResult["ouijachannel"];
                var bToggleOuija = oResult["toggleouija"];
                Ouija.ProcessMessage(client, msg, iOuijaChannelID, bToggleOuija);

                CommandListener.ProcessMessage(client, msg);
                Ventriloquist.ProcessMessage(client, msg);
                //WhatRepeat.ProcessMessage(client, msg);
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });


    client.on('messageUpdate', async (oldMessage, newMessage) => {
        try {
            var iMsgChannelID = oldMessage.channel.id;
            var oGuild = oldMessage.guild;
            if (!oGuild)
                return;


            var oQueryObject = {
                guildID: oGuild.id,
                production: Globals.Environment.PRODUCTION
            }

            let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);
            var oResult = aResult.length > 0 ? aResult[0] : null;
            if (!oResult) {
                Options.CheckServerOptionsExist(client, oGuild)
                msg.channel.send("Sorry just had a bit of a hiccup, can you try again please?")
                return;
            }

            var iCopyInputChannelID = oResult["copyinputchannel"];
            var iCopyOutputChannelID = oResult["copyoutputchannel"];
            var bToggleChannelCopy = oResult["togglechannelcopy"];
            FoyerCopy.OnMessageUpdate(client, oldMessage, newMessage, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });

    client.on('messageDelete', async msg => {
        try {
            var iMsgChannelID = msg.channel.id;
            var oGuild = msg.guild;
            if (!oGuild)
                return;


            var oQueryObject = {
                guildID: oGuild.id,
                production: Globals.Environment.PRODUCTION
            }

            let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);

            var oResult = aResult.length > 0 ? aResult[0] : null;
            if (!oResult) {
                Options.CheckServerOptionsExist(client, oGuild)
                msg.channel.send("Sorry just had a bit of a hiccup, can you try again please?")
                return;
            }

            var iCopyInputChannelID = oResult["copyinputchannel"];
            var iCopyOutputChannelID = oResult["copyoutputchannel"];
            var bToggleChannelCopy = oResult["togglechannelcopy"];
            FoyerCopy.OnMessageDelete(client, msg, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });

    client.on('guildMemberAdd', async member => {
        // Don't need to query stuff yet for this event
        try {
            FoyerCopy.OnGuildMemberAdd(member);
            Approve.HandleMemberInvite(member)
            // Hotfix for one guild
            // if(member.guild.id == "190543951080456192")
            // {
            //     member.addRole('457737348218617857')
            // }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });

    client.on('roleDelete', async role => {
        // Don't need to query stuff yet for this event
        try {
            Ranks.ForceDeleteRank(client, role);
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    });
}

