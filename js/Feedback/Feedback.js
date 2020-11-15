
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const Discord = require('discord.js');
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Feedback",
  "Give feedback to a server that we share!",
   "",
   "",
   "``g!feedback`` (This will start a wizard to give feedback)"
)

exports.ReadMessage = async function (client, msg) {
    if(msg.content === Globals.cCommandPrefix + "feedback")
        StartWizard(client, msg);
    
}

async function StartWizard(client, msg)
{
    let oFeedbackMessageOptions = {author: msg.author};
    await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Hi, did you want to send a feedback message to a server we're both in?? (Y/N)\r\n",
            description: "",
        }
    })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    collector.on('collect', newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "N") {
                collector.stop();
                newmsg.channel.send("Ok, whatever then... :sob:");
            }
            else if (newmsg.content == "Y") {
                collector.stop();
                DetermineServerToSendMessage(client, msg, oFeedbackMessageOptions);
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    }); 
}

async function DetermineServerToSendMessage(client, msg, oFeedbackMessageOptions, cErrorString = "")
{
    let oAuthorGuildsMap = msg.author.client.guilds.cache;
    let aAuthorGuilds = Array.from( oAuthorGuildsMap.values() );
    let cGuildString = aAuthorGuilds.map((channel, index) => `${index + 1}) ${channel.name}`).join('\r\n');
    await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: cErrorString + "\r\n\r\n" + "Ok then. Pick which server you wish to send the message to from the list below (or type 'EXIT' to stop).\r\n\r\n Just type in the corresponding number to the left of the channel name",
            description: cGuildString,
        }
    })
    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    collector.on('collect', newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "EXIT") {
                collector.stop();
                newmsg.channel.send("Ok, whatever then... :sob:");
            }
            else if (parseInt(newmsg.content) != NaN) {
                collector.stop();
                let iIndex = parseInt(newmsg.content) - 1;
                let oChosenGuild = aAuthorGuilds[iIndex];
                if(oChosenGuild)
                {
                    oFeedbackMessageOptions.guild = oChosenGuild;
                    DetermineAnonymity(client, msg, oFeedbackMessageOptions)
                }
                else
                {
                    let cError = "Sorry I couldn't find a guild from your input. Please try again"
                    DetermineServerToSendMessage(client, msg, oFeedbackMessageOptions, cError)
                }
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    }); 
}

async function DetermineAnonymity(client, msg, oFeedbackMessageOptions, cErrorString = "")
{
    await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Would you like your message to be anonymous? (Y/N)\r\n",
            description: "If 'N', the mods will see your identity. If 'Y', your secret is safe with Groovebot!! (Type 'EXIT' to stop)",
        }
    })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    collector.on('collect', newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "EXIT") {
                collector.stop();
                newmsg.channel.send("Ok, whatever then... :sob:");
            }
            if (newmsg.content.toUpperCase() == "N") {
                collector.stop();
                oFeedbackMessageOptions.anonymous = false;
                DetermineTextToSend(client, msg, oFeedbackMessageOptions);
            }
            else if (newmsg.content == "Y") {
                collector.stop();
                oFeedbackMessageOptions.anonymous = true;
                DetermineTextToSend(client, msg, oFeedbackMessageOptions);
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    }); 
}

async function DetermineTextToSend(client, msg, oFeedbackMessageOptions, cErrorString)
{
    await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Ok, cool. Now, please type in the message you wish to send to the mods. Keep it to one message\r\n",
            description: "(Type 'EXIT' to stop)",
        }
    })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    collector.on('collect', newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "EXIT") {
                collector.stop();
                newmsg.channel.send("Ok, whatever then... :sob:");
            }
            else {
                collector.stop();
                oFeedbackMessageOptions.message = newmsg;
                ConfirmMessageToSend(client, msg, oFeedbackMessageOptions);
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    }); 
}

async function ConfirmMessageToSend(client, msg, oFeedbackMessageOptions)
{
    let oMessageToSendPreview = await BuildMessage(oFeedbackMessageOptions, msg.channel);
    await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Ok Last Step. Above is the message I will send to the mods based on your options. \r\n",
            description: "(Type 'Y' if you want me to send the message to the mods. Type 'N' if you want me to stop)",
        }
    })

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    collector.on('collect', async newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "N") {
                collector.stop();
                newmsg.channel.send("Ok, whatever then... :sob:");
            }
            else if (newmsg.content.toUpperCase() == "Y") {
                collector.stop();
                let bSuccess = await SendMessageToMods(client, oFeedbackMessageOptions);
                if(bSuccess)
                    msg.channel.send("I've successfully sent the message to the mods!!")
                else
                    msg.channel.send("Uh oh, I wasn't able to send the message. Please try again.")

            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    }); 
}

async function SendMessageToMods(client, oFeedbackMessageOptions)
{
    try{
        var oQueryObject = {
            guildID: oFeedbackMessageOptions.guild.id,
            production: Globals.Environment.PRODUCTION
        }

        let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);
        var oResult = aResult.length > 0 ? aResult[0] : null;
        let iFeedbackChannelID = oResult["feedbackchannel"]
        let oFeedbackChannel = oFeedbackMessageOptions.guild.channels.cache.get(iFeedbackChannelID);
        if(oFeedbackChannel)
        {
            let oMessageSent = await BuildMessage(oFeedbackMessageOptions, oFeedbackChannel);
            return oMessageSent ? true : false;
        }
        else
            return false;
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
        return false;
    }
}

async function BuildMessage(oFeedbackMessageOptions, oDMChannel)
{

    let cTopMessage = `New Feedback Message!`
    const image = oFeedbackMessageOptions.message.attachments.size > 0 ? oFeedbackMessageOptions.message.attachments.array()[0].url : '';
    const embed = new Discord.MessageEmbed()
        .setColor("PURPLE")
        .setDescription(oFeedbackMessageOptions.message.content)
        .setAuthor(oFeedbackMessageOptions.anonymous ? "Anonymous" : oFeedbackMessageOptions.author.tag, oFeedbackMessageOptions.anonymous ? null : oFeedbackMessageOptions.author.displayAvatarURL({size:1024, format: "png"}))
        .setTimestamp()
        .setFooter(`Sent to: ${oFeedbackMessageOptions.guild.name}`)
        .setImage(image);
    let oBuiltMessage = await oDMChannel.send(cTopMessage, embed);
    return oBuiltMessage;
}


