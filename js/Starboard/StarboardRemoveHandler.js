const Globals = require('../Globals.js');
const StarboardUtils = require('./StarboardUtils.js');
const ErrorHandler = require('../ErrorHandler.js')
const Discord = require('discord.js');

async function ProcessReact(react, oServerOptions) {
    if (StarboardUtils.IsStar(react)) {
        let oArgs = {
            bPassedThreshold: StarboardUtils.PassedStarboardThreshold(react.message, oServerOptions["starboardthreshold"]),
            iStarCount: StarboardUtils.GetStarCount(react.message)
        }
        HandleStarboardChannelMessage(react.message, oServerOptions, oArgs);
    }
}
exports.ProcessReact = ProcessReact;

async function ProcessReactRemoveAll(message, oServerOptions) {
    let oArgs = {
        bPassedThreshold: false,
        iStarCount: 0
    }
    HandleStarboardChannelMessage(message, null, oServerOptions, oArgs);
}
exports.ProcessReactRemoveAll = ProcessReactRemoveAll;




async function HandleStarboardChannelMessage(msg, oServerOptions, oArgs) {
    let oStarboardChannel = Globals.g_Client.channels.cache.find(c => c.id == oServerOptions["starboardchannel"]);
    if (!oStarboardChannel) {
        return;
    }
    let fetchedMessages = await oStarboardChannel.messages.fetch({ limit: 100 });
    let oStarboardMessage = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(msg.id));
    if (oStarboardMessage && oArgs["bPassedThreshold"]) {
        StarboardUtils.EditStarboardMessage(msg, oStarboardMessage, oArgs)
       // StarboardUtils.UpsertStarboardRemoveReactDB(msg, user, oStarboardMessage, oArgs)
    } else if (oStarboardMessage && !oArgs["bPassedThreshold"] && oArgs["iStarCount"] > 0) {
        oStarboardMessage.delete();
        //StarboardUtils.UpsertStarboardRemoveReactDB(msg, user, oStarboardMessage, oArgs)
    } else if (!oArgs["bPassedThreshold"] && oArgs["iStarCount"] == 0) {
        if (oStarboardMessage)
            oStarboardMessage.delete();
        //StarboardUtils.DeleteStarboardReactDB(msg, user, oStarboardMessage, oArgs)
    }



} 