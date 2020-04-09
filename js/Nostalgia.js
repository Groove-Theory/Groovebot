const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const Discord = require('discord.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Nostalgia",
  "Get Groove's old pfp",
   "",
   "",
   "``g!nostalgia`` (gets the old pfp)"
)


exports.Init = async function (client, msg) {
  try {
    msg.channel.send("Better times...",{
        files: ['./images/Groove_OldPFP.png'],
        options: {content: "Better times...."},
      });

  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}
