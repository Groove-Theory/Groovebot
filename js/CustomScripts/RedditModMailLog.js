const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const snoowrap = require('snoowrap');
const Discord = require('discord.js');
const { ModMailStream } = require("snoostorm");

const iModMailChannelID = Globals.Environment.PRODUCTION ? "737819365289885817" : "737819633691656274"
exports.Init = async function (client, msg) {
    try{
        let oModMailChannel = Globals.g_Client.channels.cache.get(iModMailChannelID);
        console.log("reddit begin...");
        var oSubreddit = await Globals.redditAPI.getSubreddit('COMPLETEANARCHY');

        const stream = new ModMailStream(Globals.redditAPI, { subreddit: "COMPLETEANARCHY", results: 5, limit:5, pollTime: 10000 });

        stream.on("item", mailmessage => {
            HandleModMailStream(mailmessage, oModMailChannel)
        })

    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}

async function HandleModMailStream(mailmessage, oModMailChannel)
{
    let fetchedMessages = await oModMailChannel.messages.fetch({ limit: 100 });
    let prevMessageIDs = fetchedMessages.map(m => m.content.replace("MessageID = ", ""));
    if(prevMessageIDs.indexOf(mailmessage.id) == -1)
        CreateModMailEmbedMessage(mailmessage, oModMailChannel);
}

function CreateModMailEmbedMessage(mailmessage, oModMailChannel) {
    let cTopMessage = `MessageID = ${mailmessage.id}`
    const embed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle(`**__Title__**: ${mailmessage.subject}`)
        .setDescription(`**__Message__**: \r\n ${mailmessage.body.slice(0,1500)}`)
        .setAuthor(`From: ${mailmessage.author.name}`)
        .addField("Link to Sender:", `[/u/${mailmessage.author.name}](https://www.reddit.com/user/${mailmessage.author.name})`, false)
        .addField("Link to Recipient:", `[/u/${mailmessage.dest}](https://www.reddit.com/user/${mailmessage.dest})`, false)
        .setTimestamp();
    oModMailChannel.send(cTopMessage, embed);
}