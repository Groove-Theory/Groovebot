const Discord = require('discord.js');
const ErrorHandler = require('./ErrorHandler.js')
const Globals = require('./Globals.js')
const CommandList = require('./CommandList.js')
const Options = require('./Options.js')
const Database = require('./Database.js')
const ChannelListener = require('./ChannelListener.js')
const SpotifyHandler = require('./APIHandlers/SpotifyHandler.js')
const YoutubeHandler = require('./APIHandlers/YoutubeHandler.js')
const TwitterHandler = require('./APIHandlers/TwitterHandler.js')
const RedditHandler = require('./APIHandlers/RedditHandler.js')
const fs = require('fs');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const token = process.env.DISCORD_BOT_SECRET;
const CustomScriptsMain = require('./CustomScripts/CustomScriptsMain.js')
/*
const ErrorHandler = require('./ErrorHandler.js');

ErrorHandler.HandleError(client, err);

        var x = null;
        var y = x.f;
*/

process.on('uncaughtException', function (err) {
  console.log("here");
  ErrorHandler.HandleError(client, err)
});

process.on('unhandledRejection', (reason, promise) => {
  console.log("here");
  ErrorHandler.HandleError(client, reason)
})


client.on('ready', async () => {
  try {
    let bSuccess = await Database.Init(client);
    if (bSuccess) {
      Globals.Database = Database;
      Globals.g_Client = client;

      console.log("I'm in: --> " + client.user.username);
      client.guilds.cache.forEach(function (oGuild) {
        Options.CheckServerOptionsExist(client, oGuild)
      });
      Options.Onload();
      ChannelListener.Init(client);
      SpotifyHandler.InitSpotifyHandler();
      YoutubeHandler.InitYoutubeHandler();
      TwitterHandler.InitTwitterHandler();
      RedditHandler.InitRedditHandler();

      var compliment_obj = JSON.parse(fs.readFileSync('./JSONFiles/Compliments.json', 'utf8'));
      if (compliment_obj)
        Globals.aCompliments = compliment_obj.Compliments;

      CommandList.InitCommandMap();
      CustomScriptsMain.Init();
      if(Globals.Environment.PRODUCTION || Globals.Environment.STAGE)
      {
        var oGrooveUser = client.users.cache.get(Globals.g_GrooveID);
        oGrooveUser.send("I've successfully loaded!!");
      }
    }
  }
  catch (err) {
    var oGrooveUser = client.users.cache.get(Globals.g_GrooveID);
    oGrooveUser.send("Something bad happened : \r\n" + err.stack ? err.stack : err);
    ErrorHandler.HandleError(client, err)
  }
});


client.login(token);