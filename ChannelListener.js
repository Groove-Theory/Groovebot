const Globals = require("./Globals.js");
const Options = require("./Options.js");
const ErrorHandler = require("./ErrorHandler.js");
const FoyerCopy = require("./FoyerCopy.js");
const Ouija = require("./Ouija.js");
const CommandListener = require("./CommandListener.js");
const Ventriloquist = require("./Ventriloquist.js");
const SilenceChannel = require("./SilenceChannel.js");

exports.Init = function Init(client) {
  client.on("message", async msg => {
    try {
      const oGuild = msg.guild;
      if (!oGuild) {
        return;
      }

      const oQueryObject = {
        guildID: oGuild.id,
        production: Globals.bProduction
      };

      const aResult = await Globals.Database.Query(
        client,
        "ServerOptions",
        oQueryObject
      );
      const oResult = aResult.length > 0 ? aResult[0] : null;
      if (!oResult) {
        Options.CheckServerOptionsExist(client, oGuild);
        msg.channel.send(
          "Sorry just had a bit of a hiccup, can you try again please?"
        );
        return;
      }

      const aSilenceChannelIDs = oResult.silencechannels;
      const bSilenced = SilenceChannel.ProcessMessage(
        client,
        msg,
        aSilenceChannelIDs
      );

      if (!bSilenced) {
        const iCopyInputChannelID = oResult.copyinputchannel;
        const iCopyOutputChannelID = oResult.copyoutputchannel;
        const bToggleChannelCopy = oResult.togglechannelcopy;
        FoyerCopy.OnMessage(
          client,
          msg,
          iCopyInputChannelID,
          iCopyOutputChannelID,
          bToggleChannelCopy
        );

        const iOuijaChannelID = oResult.ouijachannel;
        const bToggleOuija = oResult.toggleouija;
        Ouija.ProcessMessage(client, msg, iOuijaChannelID, bToggleOuija);

        CommandListener.ProcessMessage(client, msg);
        Ventriloquist.ProcessMessage(client, msg);
      }
    } catch (err) {
      ErrorHandler.HandleError(client, err);
    }
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    try {
      const oGuild = oldMessage.guild;
      if (!oGuild) {
        return;
      }

      const oQueryObject = {
        guildID: oGuild.id,
        production: Globals.bProduction
      };

      const aResult = await Globals.Database.Query(
        client,
        "ServerOptions",
        oQueryObject
      );
      const oResult = aResult.length > 0 ? aResult[0] : null;
      if (!oResult) {
        Options.CheckServerOptionsExist(client, oGuild);
        oldMessage.channel.send(
          "Sorry just had a bit of a hiccup, can you try again please?"
        );
        return;
      }

      const iCopyInputChannelID = oResult.copyinputchannel;
      const iCopyOutputChannelID = oResult.copyoutputchannel;
      const bToggleChannelCopy = oResult.togglechannelcopy;
      FoyerCopy.OnMessageUpdate(
        client,
        oldMessage,
        newMessage,
        iCopyInputChannelID,
        iCopyOutputChannelID,
        bToggleChannelCopy
      );
    } catch (err) {
      ErrorHandler.HandleError(client, err);
    }
  });

  client.on("messageDelete", async msg => {
    try {
      const oGuild = msg.guild;
      if (!oGuild) {
        return;
      }

      const oQueryObject = {
        guildID: oGuild.id,
        production: Globals.bProduction
      };

      const aResult = await Globals.Database.Query(
        client,
        "ServerOptions",
        oQueryObject
      );

      const oResult = aResult.length > 0 ? aResult[0] : null;
      if (!oResult) {
        Options.CheckServerOptionsExist(client, oGuild);
        msg.channel.send(
          "Sorry just had a bit of a hiccup, can you try again please?"
        );
        return;
      }

      const iCopyInputChannelID = oResult.copyinputchannel;
      const iCopyOutputChannelID = oResult.copyoutputchannel;
      const bToggleChannelCopy = oResult.togglechannelcopy;
      FoyerCopy.OnMessageDelete(
        client,
        msg,
        iCopyInputChannelID,
        iCopyOutputChannelID,
        bToggleChannelCopy
      );
    } catch (err) {
      ErrorHandler.HandleError(client, err);
    }
  });

  client.on("guildMemberAdd", async member => {
    // Don't need to query stuff yet for this event
    try {
      FoyerCopy.OnGuildMemberAdd(client, member);
    } catch (err) {
      ErrorHandler.HandleError(client, err);
    }
  });
};
