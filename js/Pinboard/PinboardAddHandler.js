const Globals = require('../Globals.js');
const PinboardUtils = require('./PinboardUtils.js');
const ErrorHandler = require('../ErrorHandler.js')

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



async function HandlePinboardChannelMessage(msg, pinner, oServerOptions, oArgs) {
    let oPinboardChannel = Globals.g_Client.channels.cache.find(c => c.id == oServerOptions["pinboardchannel"]);
    if (!oPinboardChannel) {
        return;
    }
    let fetchedMessages = await oPinboardChannel.messages.fetch({ limit: 100 });
    let iOldestMessageTimestamp = fetchedMessages.last().createdTimestamp;
    if(msg.createdTimestamp < iOldestMessageTimestamp)
        return; // It's too old, you had your chance.
        
    let oPinboardMessage = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith('📌') && m.embeds[0].footer.text.endsWith(msg.id));
    if (!oPinboardMessage && oArgs["bPassedThreshold"]) {
        oPinboardMessage = await PinboardUtils.CreateNewPinboardMessage(msg, pinner, oPinboardChannel, oArgs);
    } else if (oPinboardMessage && oArgs["bPassedThreshold"]) {
        PinboardUtils.EditPinboardMessage(msg, pinner, oPinboardMessage, oArgs)
    }
    //PinboardUtils.UpsertPinboardAddReactDB(msg, pinner, oPinboardMessage, oArgs)
} 