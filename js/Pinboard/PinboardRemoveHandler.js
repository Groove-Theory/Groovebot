const Globals = require('../Globals.js');
const PinboardUtils = require('./PinboardUtils.js');
const ErrorHandler = require('../ErrorHandler.js')
const Discord = require('discord.js');

async function ProcessReact(react, pinner, oServerOptions) {
    if (PinboardUtils.IsPin(react) && PinboardUtils.IsMod(pinner, react.message.guild)) {
        let oArgs = {
            bPassedThreshold: PinboardUtils.PassedPinboardThreshold(react.message, 1),
            iPinCount: PinboardUtils.GetPinCount(react.message)
        }
        HandlePinboardChannelMessage(react.message, pinner, oServerOptions, oArgs);
    }
}
exports.ProcessReact = ProcessReact;

async function ProcessReactRemoveAll(message, oServerOptions) {
    let oArgs = {
        bPassedThreshold: false,
        iPinCount: 0
    }
    HandlePinboardChannelMessage(message, null, oServerOptions, oArgs);
}
exports.ProcessReactRemoveAll = ProcessReactRemoveAll;




async function HandlePinboardChannelMessage(msg, pinner, oServerOptions, oArgs) {
    let oPinboardChannel = Globals.g_Client.channels.find(c => c.id == oServerOptions["pinboardchannel"]);
    if (!oPinboardChannel) {
        return;
    }
    let fetchedMessages = await oPinboardChannel.fetchMessages({ limit: 100 });
    let oPinboardMessage = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith('📌') && m.embeds[0].footer.text.endsWith(msg.id));
    if (oPinboardMessage && oArgs["bPassedThreshold"]) {
        PinboardUtils.EditPinboardMessage(msg, pinner, oPinboardMessage, oArgs)
       // PinboardUtils.UpsertPinboardRemoveReactDB(msg, user, oPinboardMessage, oArgs)
    } else if (oPinboardMessage && !oArgs["bPassedThreshold"] && oArgs["iPinCount"] > 0) {
        oPinboardMessage.delete();
        //PinboardUtils.UpsertPinboardRemoveReactDB(msg, user, oPinboardMessage, oArgs)
    } else if (!oArgs["bPassedThreshold"] && oArgs["iPinCount"] == 0) {
        if (oPinboardMessage)
            oPinboardMessage.delete();
        //PinboardUtils.DeletePinboardReactDB(msg, user, oPinboardMessage, oArgs)
    }



} 