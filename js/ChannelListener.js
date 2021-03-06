const Globals = require('./Globals.js');
const ErrorHandler = require('./ErrorHandler.js')
const FoyerCopy = require('./FoyerCopy.js')
const Ouija = require('./Ouija.js')
const CommandListener = require('./CommandListener.js')
const Ventriloquist = require('./Ventriloquist.js')
const SilenceChannel = require('./SilenceChannel.js')
const Approve = require('./Approve.js')
const Ranks = require('./Ranks.js')
const PinboardAddHandler = require('./Pinboard/PinboardAddHandler.js')
const PinboardRemoveHandler = require('./Pinboard/PinboardRemoveHandler.js')
const StarboardAddHandler = require('./Starboard/StarboardAddHandler.js')
const StarboardRemoveHandler= require('./Starboard/StarboardRemoveHandler.js')
const GroovePointsMessageHandler = require('./GroovePoints/GroovePointsMessageHandler.js')
const GroovePointsEmojiHandler = require('./GroovePoints/GroovePointsEmojiHandler.js')
const HaikuListener = require("./HaikuListener.js");
const Feedback = require("./Feedback/Feedback.js");

exports.Init = function (client) {
    client.on('message', async msg => {
        try {
            var iMsgChannelID = msg.channel.id;
            if (msg.guild !== null) {
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

                //TODO: Get rid of this or implement this right
                //var aSilenceChannelIDs = oResult["silencechannels"];
                //var bSilenced = SilenceChannel.ProcessMessage(client, msg, aSilenceChannelIDs);

            
                var iCopyInputChannelID = oResult["copyinputchannel"];
                var iCopyOutputChannelID = oResult["copyoutputchannel"];
                var bToggleChannelCopy = oResult["togglechannelcopy"];
                FoyerCopy.OnMessage(client, msg, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);

                var iOuijaChannelID = oResult["ouijachannel"];
                var bToggleOuija = oResult["toggleouija"];
                Ouija.ProcessMessage(client, msg, iOuijaChannelID, bToggleOuija);

                CommandListener.ProcessMessage(client, msg);
                Ventriloquist.ProcessMessage(client, msg);
                GroovePointsMessageHandler.ProcessMessage(client, msg);
                HaikuListener.ProcessMessage(client, msg);

            }
            else
            {
                Feedback.ReadMessage(client, msg);
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
            //     member.roles.add('457737348218617857')
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

    client.on('messageReactionAdd', async(reaction, user) => {       
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();

        if(reaction.message.guild === null) return;
        let oGuild = reaction.message.guild;
        let oServerOptions = await getServerOptions(oGuild)
        if(oServerOptions["pinboardchannel"])
            PinboardAddHandler.ProcessReact(reaction, user, oServerOptions)
        if(oServerOptions["starboardchannel"])
            StarboardAddHandler.ProcessReact(reaction, oServerOptions)

    });

    client.on('messageReactionRemove', async(reaction, user) => {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();

        if(reaction.message.guild === null) return;
        let oGuild = reaction.message.guild;
        let oServerOptions = await getServerOptions(oGuild)
        if(oServerOptions["pinboardchannel"])
            PinboardRemoveHandler.ProcessReact(reaction, user, oServerOptions)
        if(oServerOptions["starboardchannel"])
            StarboardRemoveHandler.ProcessReact(reaction, oServerOptions)
    });

    client.on('messageReactionRemoveAll', async(message) => {

        if (message.partial) await message.fetch();

        if(reaction.message.guild === null) return;
        let oGuild = message.guild;
        let oServerOptions = await getServerOptions(oGuild)
        if(oServerOptions["pinboardchannel"])
            PinboardRemoveHandler.ProcessReactRemoveAll(message, oServerOptions)
        if(oServerOptions["starboardchannel"])
            StarboardRemoveHandler.ProcessReactRemoveAll(message, oServerOptions)
    });

    client.on('guildMemberRemove', async(oMember) => {

        Approve.LogMemberRoles(client,oMember)
    });
    
}

async function getServerOptions(oGuild) {
    var oQueryObject = {
        guildID: oGuild.id,
        production: Globals.Environment.PRODUCTION
    }

    let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);

    let oResult = aResult.length > 0 ? aResult[0] : null;

    return oResult;
}
