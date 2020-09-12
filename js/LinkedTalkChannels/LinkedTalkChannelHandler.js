const Globals = require('../Globals.js')
const Discord = require('discord.js');
const LinkedTalkChannels = require('../Classes/LinkedTalkChannels.js');
const ErrorHandler = require('../ErrorHandler.js');
let registerFont, createCanvas, loadImage;
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
    "Talk",
    "Talk as Groovebot into another channel (that's already linked)",
     "``<message>`` message to be sent to the other channel (can also handle links)",
     "",
     "``g!talk hello`` (Groovebot sends 'hello' to the linked channel)"
 )

exports.Talk = async function (client, msg) {
    try {
        
        let oLinkedTalkChannel = new LinkedTalkChannels();
        await oLinkedTalkChannel.Query(msg.guild.id, msg.channel.id);
        if(oLinkedTalkChannel.outputChannel)
            oLinkedTalkChannel.Talk(msg);
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
    }
}
