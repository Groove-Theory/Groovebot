const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const Discord = require('discord.js');

const bRecordDelete = true;
exports.OnMessage = function (client, msg, iMainChannelID, iCopyChannelID, bUseCopyFunction) {
    try {
        var oGuild = msg.guild;

        if (bUseCopyFunction && iMainChannelID && iCopyChannelID && iMainChannelID == msg.channel.id) {
            var oGuild = msg.guild;
            var copyChannel = oGuild.channels.cache.get(iCopyChannelID);
            if (copyChannel) {

                let aFileAttachments = Array.from(msg.attachments.values()).map(x => x.url);
                var bUseImageAttach = aFileAttachments.length == 1 && fileIsImage(aFileAttachments[0])
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('(New Message)')
                    .setAuthor(msg.author.username, msg.author.displayAvatarURL({size:1024, format: "png"}))
                    .setDescription(msg.content)
                    .attachFiles(bUseImageAttach ? [] : aFileAttachments)
                    .setTimestamp()
                    .setImage(bUseImageAttach ? aFileAttachments[0] : "")
                    .setFooter( msg.author.username, msg.author.displayAvatarURL({size:1024, format: "png"}));

                copyChannel.send(exampleEmbed);
            }
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
};

exports.OnMessageUpdate = function (client, oldMessage, newMessage, iMainChannelID, iCopyChannelID, bUseCopyFunction) {
    try {
        var oGuild = oldMessage.guild;

        if (bUseCopyFunction && iMainChannelID && iCopyChannelID && iMainChannelID == oldMessage.channel.id) {
            var copyChannel = oGuild.channels.cache.get(iCopyChannelID);
            if (copyChannel) {
                copyChannel.send(
                    {
                        embed:
                        {
                            color: 3447003,
                            author:
                            {
                                name: newMessage.author.username,
                                icon_url: newMessage.author.displayAvatarURL({size:1024, format: "png"})
                            },
                            title: "(Message Edited)",
                            description: "__**Old Message:**__ \r\n" + oldMessage.content + "\r\n\r\n" +
                                "__**New Message:**__\r\n" + newMessage.content + "\r\n\r\n",
                            timestamp: new Date(),
                            footer:
                            {
                                icon_url: newMessage.author.displayAvatarURL({size:1024, format: "png"}),
                                text: newMessage.author.username
                            }
                        }
                    });
            }
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}

exports.OnMessageDelete = function (client, msg, iMainChannelID, iCopyChannelID, bUseCopyFunction) {
    try {
        var oGuild = msg.guild;

        if (bUseCopyFunction && iCopyChannelID && iCopyChannelID == msg.channel.id) {
            var copyChannel = oGuild.channels.cache.get(iCopyChannelID);
            if (copyChannel) {
                copyChannel.send(
                    {
                        embed:
                        {
                            color: 3447003,
                            title: "(Log Message Deleted)",
                            description: "*(a message from me was deleted in this channel)* :frowning2:",
                            timestamp: new Date(),
                            footer:
                            {
                                icon_url: client.user.displayAvatarURL({size:1024, format: "png"})
                            }
                        }
                    });
            }
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}

// Should only work for the original guild, not any new ones
exports.OnGuildMemberAdd = function (member) {
    try {
        if (Globals.Environment.PRODUCTION && member.guild.id == Globals.g_GuildID) {
            console.log("Member Added");
            console.log(member);

            member.send("Hey " + member.user.username + ", welcome to \"The Gang Forms a Union\"! \r\n" +
                "Please go to the #foyer channel, and tell us where you followed this link from, and please provide us with a social media account. " +
                "Twitter and reddit are preferred, but almost anything will work. \r\n " +
                "Please also review the rules in the #these-are-the-rules channel and let us know if you have any questions. \r\n" +
                "The #foyer channel may appear empty when you go there, but if you submit your info in the channel, a mod should get to you as soon as possible. \r\n" +
                "Thanks. I'm just a silly bot doing silly bot things :robot:, so please don't respond to me."
            ).catch(
                err => console.log(err)
            );
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}

function fileIsImage(cURL)
{
    return cURL.endsWith(".png") ||
    cURL.endsWith(".jpg") ||
    cURL.endsWith(".jpeg") ||
    cURL.endsWith(".gif")
}