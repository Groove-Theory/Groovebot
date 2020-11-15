
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

let reactfilter = () => {return true;}

exports.ReadMessage = async function (client, msg) {
    if(msg.content === Globals.cCommandPrefix + "feedback")
    {
        reactfilter = (reaction, user) => { 
            return user.id === msg.author.id
        };
        StartWizard(client, msg);
    }
    
}

async function StartWizard(client, msg)
{
    let oFeedbackMessageOptions = {author: msg.author};
    let oWizardMessage = await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Hi, did you want to send a feedback message to a server we're both in?? (Y/N)\r\n",
            description: `🇾 = "Yes I want to send a feedback message" \r\n 🇳 = "No I don't wanna do this anymore"`,
        }
    })
    var collector = new Discord.ReactionCollector(oWizardMessage,  reactfilter, {max:100, time:120000});
    await oWizardMessage.react("🇾")
    await oWizardMessage.react("🇳")
    //var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    collector.on('collect', reaction => {
        try {
            if (reaction.emoji.name == "🇳") {
                collector.stop();
                msg.channel.send("Ok, whatever then... :sob:");
            }
            else if (reaction.emoji.name == "🇾") {
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
    let oClientGuilds = msg.author.client.guilds.cache;
    let oAuthorGuildsMap = oClientGuilds.filter(guild => guild.members.cache.has(msg.author.id))
    let aAuthorGuilds = Array.from( oAuthorGuildsMap.values() );
    if(aAuthorGuilds.length === 1)
    {
        oFeedbackMessageOptions.guild = aAuthorGuilds[0];
        DetermineAnonymity(client, msg, oFeedbackMessageOptions)
    }
    else
    {
        let cGuildString = aAuthorGuilds.map((channel, index) => `${index + 1}) ${channel.name}`).join('\r\n');
        let oWizardMessage = await msg.channel.send(
        {
            embed:
            {
                color: 3447003,
                title: cErrorString + "\r\n\r\n" + "Ok then. Pick which server you wish to send the message to from the list below (or press 🚫 to stop).\r\n\r\n Just type in the corresponding number to the left of the channel name",
                description: cGuildString,
            }
        })
        await oWizardMessage.react("🚫");
        var reactioncollector = new Discord.ReactionCollector(oWizardMessage,  reactfilter, {max:100, time:120000});
        var messagecollector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
        reactioncollector.on('collect', reaction => {
            try {
                if (reaction.emoji.name == "🚫") {
                    reactioncollector.stop(); messagecollector.stop();
                    msg.channel.send("Ok, whatever then... :sob:");
                }
            }
            catch (err) {
                ErrorHandler.HandleError(client, err);
            }
        }); 
        messagecollector.on('collect', newmsg => {
            try {
                if (newmsg.content.toUpperCase() == "EXIT") {
                    reactioncollector.stop(); messagecollector.stop();
                    msg.channel.send("Ok, whatever then... :sob:");
                }
                else if (parseInt(newmsg.content) != NaN) {
                    reactioncollector.stop(); messagecollector.stop();
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
}

async function DetermineAnonymity(client, msg, oFeedbackMessageOptions, cErrorString = "")
{
    let oWizardMessage = await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Would you like your message to be anonymous? (Y/N)\r\n",
            description: `🕵️ = "Yes I want to send anonymously (my secret is safe with Groovebot) \r\n ☺️ = "No, I DONT want to send anonymous; I want the mods to see that it's me \r\n 🚫 = "I'm done I want to stop"`
        }
    })

    var collector = new Discord.ReactionCollector(oWizardMessage,  reactfilter, {max:100, time:120000});
    await oWizardMessage.react("🕵️")
    await oWizardMessage.react("☺️")
    await oWizardMessage.react("🚫")    
    collector.on('collect', reaction => {
        try {
            if (reaction.emoji.name == "🚫") {
                collector.stop();
                msg.channel.send("Ok, whatever then... :sob:");
            }
            else if (reaction.emoji.name == "☺️") {
                collector.stop();
                oFeedbackMessageOptions.anonymous = false;
                DetermineTextToSend(client, msg, oFeedbackMessageOptions);
            }
            else if (reaction.emoji.name == "🕵️") {
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
    let oWizardMessage = await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Ok, cool. Now, please type in the message you wish to send to the mods. Keep it to one message (You can also attach an image or file with your message too)\r\n",
            description: "(Type 'EXIT' to stop)",
        }
    })

    var reactioncollector = new Discord.ReactionCollector(oWizardMessage,  reactfilter, {max:100, time:120000});
    var messagecollector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,{time: 120000});
    await oWizardMessage.react("🚫");
    reactioncollector.on('collect', reaction => {
        try {
            if (reaction.emoji.name == "🚫") {
                reactioncollector.stop(); messagecollector.stop();
                msg.channel.send("Ok, whatever then... :sob:");
            }
        }
        catch (err) {
            ErrorHandler.HandleError(client, err);
        }
    }); 
    messagecollector.on('collect', newmsg => {
        try {
            if (newmsg.content.toUpperCase() == "EXIT") {
                reactioncollector.stop(); messagecollector.stop();
                newmsg.channel.send("Ok, whatever then... :sob:");
            }
            else {
                reactioncollector.stop(); messagecollector.stop();
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
    let oWizardMessage = await msg.channel.send(
    {
        embed:
        {
            color: 3447003,
            title: "Ok Last Step. Above is the message I will send to the mods based on your options. \r\n",
            description: `📧 = "Yes I want to send the above message to the mods" \r\n 🚫 = "No I don't want to send the message and I want to leave"`
        }
    })

    var collector = new Discord.ReactionCollector(oWizardMessage,  reactfilter, {max:100, time:120000});
    await oWizardMessage.react("📧")
    await oWizardMessage.react("🚫")  
      
    collector.on('collect', async reaction => {
        try {
            if (reaction.emoji.name == "🚫") {
                collector.stop();
                msg.channel.send("Ok, whatever then... :sob:");
            }
            else if (reaction.emoji.name == "📧") {
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


