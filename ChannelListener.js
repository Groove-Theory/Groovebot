const Globals = require('./Globals.js');
const FoyerCopy = require('./FoyerCopy.js')
const CommandListener = require('./CommandListener.js')
const Ventriloquist = require('./Ventriloquist.js')

exports.Init = function(client) {
    client.on('message', msg => {
        var iMsgChannelID = msg.channel.id;
        var oGuild = msg.guild;

        var oQueryObject = {
            guildID: oGuild.id,
            production: Globals.bProduction
        }

        Globals.Database.Query("ServerOptions", oQueryObject).then(function(aResult) {
            var oResult = aResult.length > 0 ? aResult[0] : null;
            if (!oResult)
                return;

            var iCopyInputChannelID = oResult["copyinputchannel"];
            var iCopyOutputChannelID = oResult["copyoutputchannel"];
            var bToggleChannelCopy = oResult["togglechannelcopy"];
            FoyerCopy.OnMessage(client, msg, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);
            CommandListener.ProcessMessage(client, msg);
            Ventriloquist.ProcessMessage(client, msg);
        });
    });

    client.on('messageUpdate', (oldMessage, newMessage) => {
        var iMsgChannelID = oldMessage.channel.id;
        var oGuild = oldMessage.guild;

        var oQueryObject = {
            guildID: oGuild.id,
            production: Globals.bProduction
        }

        Globals.Database.Query("ServerOptions", oQueryObject).then(function(aResult) {
            var oResult = aResult.length > 0 ? aResult[0] : null;
            if (!oResult)
                return;

            var iCopyInputChannelID = oResult["copyinputchannel"];
            var iCopyOutputChannelID = oResult["copyoutputchannel"];
            var bToggleChannelCopy = oResult["togglechannelcopy"];
            FoyerCopy.OnMessageUpdate(client, oldMessage, newMessage, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);
        });
    });

    client.on('messageDelete', msg => {
        var iMsgChannelID = msg.channel.id;
        var oGuild = msg.guild;

        var oQueryObject = {
            guildID: oGuild.id,
            production: Globals.bProduction
        }

        Globals.Database.Query("ServerOptions", oQueryObject).then(function(aResult) {
            var oResult = aResult.length > 0 ? aResult[0] : null;
            if (!oResult)
                return;

            var iCopyInputChannelID = oResult["copyinputchannel"];
            var iCopyOutputChannelID = oResult["copyoutputchannel"];
            var bToggleChannelCopy = oResult["togglechannelcopy"];
            FoyerCopy.OnMessageDelete(client, msg, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);
        });
    });

    client.on('guildMemberAdd', member => {
        // Don't need to query stuff yet for this event
        FoyerCopy.OnGuildMemberAdd(member);

        // var iMsgChannelID = msg.channel.id;
        // var oGuild = msg.guild;

        // var oQueryObject = {
        //     guildID: oGuild.id,
        //     production: Globals.bProduction
        // }

        // Globals.Database.Query("ServerOptions", oQueryObject).then(function(aResult) {
        //     var iCopyInputChannelID = oResult["copyinputchannel"];
        //     var iCopyOutputChannelID = oResult["copyoutputchannel"];
        //     var bToggleChannelCopy = oResult["togglechannelcopy"];
        //     FoyerCopy.OnMessage(client, msg, iCopyInputChannelID, iCopyOutputChannelID, bToggleChannelCopy);
        // });
    });
}
