const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const Twitter = require('twitter');
const Discord = require('discord.js');
const { Autohook } = require('twitter-autohook');

const iModMailChannelID = Globals.Environment.PRODUCTION ? "737819365289885817" : "737819633691656274"
exports.Init = async function (client, msg) {
    try{
        

        let oModMailChannel = Globals.g_Client.channels.cache.get(iModMailChannelID);
        Globals.TwitterApiWebhook.on('event', async event => {
            if (event.direct_message_events) {
                await CreateModMailEmbedMessage(event, oModMailChannel);
            }
        });
        console
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}


function CreateModMailEmbedMessage(event, oModMailChannel) {
    const dmMessage = event.direct_message_events.shift();
    const messagerUser = event.users[dmMessage.message_create.sender_id];

    let cTopMessage = `MessageID = ${dmMessage.id}`
    const embed = new Discord.MessageEmbed()
        .setColor("TEAL")
        .setTitle(`**__Title__**: Twitter DM`)
        .setDescription(`**__Message__**: \r\n ${dmMessage.message_create.message_data.text.slice(0,1500)}`)
        .setAuthor(`From: ${messagerUser.screen_name}`)
        .setThumbnail(messagerUser.profile_image_url_https)
        .addField("Link to Sender:", `https://twitter.com/${messagerUser.screen_name}`, false)
        .setTimestamp();
    oModMailChannel.send(cTopMessage, embed);
}
