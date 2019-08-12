const Globals = require("./Globals.js");
const Vote = require("./Vote.js");
const GrooveQuote = require("./GrooveQuote.js");
const Help = require("./Help.js");
const Ventriloquist = require("./Ventriloquist.js");
const Dictionary = require("./Dictionary.js");
const Compliment = require("./Compliment.js");
const Nickname = require("./Nickname.js");
const Idiom = require("./Idiom.js");
const KeySmash = require("./KeySmash.js");
const Options = require("./Options.js");
const ErrorHandler = require("./ErrorHandler.js");

exports.ProcessMessage = async function ProcessMessage(client, msg) {
  try {
    let cCommandPrefix = Globals.bProduction ? "g!" : "G!";
    if (msg.author.id !== client.user.id) {
      const msgChannel = client.channels.get(msg.channel.id);
      const msgText = msg.content;
      switch (msgText) {
        case cCommandPrefix + "help":
          Help.Init(client, msg);
          break;
        case cCommandPrefix + "vote":
          Vote.VoteSetup(client, msg);
          break;
        case cCommandPrefix + "getcode":
          msg.channel.send(Globals.g_GitLink);
          break;
        case cCommandPrefix + "idiom":
          Idiom.Init(client, msg);
          break;
        case cCommandPrefix + "keysmash":
          KeySmash.Init(client, msg);
          break;
        default:
          if (msgText.substring(0, 13) === cCommandPrefix + "quoteupload")
            GrooveQuote.Upload(client, msg);
          else if (msgText.substring(0, 7) === cCommandPrefix + "quote")
            GrooveQuote.Init(client, msg);
          else if (msgText.substring(0, 15) === cCommandPrefix + "ventriloquist")
            Ventriloquist.Change(client, msg);
          else if (msgText.substring(0, 12) === cCommandPrefix + "compliment")
            Compliment.Init(client, msg);
          else if (msgText.substring(0, 10) === cCommandPrefix + "nickname")
            Nickname.Init(client, msg);
          else if (msgText.substring(0, 9) === cCommandPrefix + "options")
            Options.Init(client, msg);
          else if (msgText.substring(0, 11) === cCommandPrefix + "makequote")
            GrooveQuote.MakeQuote(client, msg);
          else if (msgText.substring(0, 6) === "t!wiki")
            Dictionary.Init(client, msg);
          else if (msgText.substring(0, 2) === cCommandPrefix + "")
            msgChannel.send("The fuck is that shit?");
          break;
      }
    }
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};
