const ErrorHandler = require("./ErrorHandler.js");

exports.ProcessMessage = function ProcessMessage(
  client,
  msg,
  aSilenceChannelIDs
) {
  try {
    let bAllowSpecial = false;

    if (msg.author.id === client.user.id) bAllowSpecial = true;

    const oGuildMember = msg.member;

    if (
      msg.content.toLowerCase() ===
        `g!options togglesilencechannel ${msg.channel.id} off` &&
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
