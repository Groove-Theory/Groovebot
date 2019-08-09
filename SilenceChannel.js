const Globals = require("./Globals.js");
const ErrorHandler = require("./ErrorHandler.js");

const bRecordDelete = true;
exports.ProcessMessage = function(client, msg, aSilenceChannelIDs) {
  try {
    const oGuild = msg.guild;
    let bAllowSpecial = false;

    if (msg.author.id == client.user.id) bAllowSpecial = true;

    const oGuildMember = msg.member;

    if (
      msg.content.toLowerCase() ==
        `g!options togglesilencechannel ${  msg.channel.id  } off` &&
      oGuildMember.hasPermission("MANAGE_GUILD")
    )
      bAllowSpecial = true;

    if (
      !bAllowSpecial &&
      aSilenceChannelIDs &&
      aSilenceChannelIDs.indexOf(msg.channel.id) > -1
    ) {
      msg.delete();
      return true;
    }
    return false;
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};
