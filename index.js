const Discord = require("discord.js");

const fs = require("fs");
const ErrorHandler = require("./ErrorHandler.js");
const Globals = require("./Globals.js");
const Options = require("./Options.js");
const Database = require("./Database.js");
const ChannelListener = require("./ChannelListener.js");

const client = new Discord.Client();
const token = process.env.DISCORD_BOT_SECRET;

process.on("uncaughtException", function UncaughtException(err) {
  console.log("here");
  ErrorHandler.HandleError(client, err);
});

process.on("unhandledRejection", reason => {
  console.log("here");
  ErrorHandler.HandleError(client, reason);
});

client.on("ready", async () => {
  try {
    const bSuccess = await Database.Init(client);
    if (bSuccess) {
      Globals.Database = Database;
      console.log(`I'm in: --> ${client.user.username}`);
      client.guilds.forEach(function OnReadyGuildsCheckOptions(oGuild) {
        Options.CheckServerOptionsExist(client, oGuild);
      });

      ChannelListener.Init(client);

      const oComplimentObj = JSON.parse(
        fs.readFileSync("./Compliments.json", "utf8")
      );
      if (oComplimentObj) Globals.aCompliments = oComplimentObj.Compliments;
    }
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
});

client.login(token);
