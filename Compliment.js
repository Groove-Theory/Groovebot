const Globals = require("./Globals.js");
const ErrorHandler = require("./ErrorHandler.js");

exports.Init = async function Init(client, msg) {
  try {
    const msgChannel = client.channels.get(msg.channel.id);
    const oMentionedUsers = msg.mentions.users;
    let cMsg = "";
    if (oMentionedUsers.size > 0) {
      oMentionedUsers.forEach(function InitAddMentions(guildMember) {
        cMsg += `<@${guildMember.id}> `;
      });
    } else {
      cMsg += `<@${msg.author.id}> `;
    }

    const cComplimentText =
      Globals.aCompliments[
        Math.floor(Math.random() * Globals.aCompliments.length)
      ];

    cMsg += cComplimentText;
    msgChannel.send(cMsg);
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};
