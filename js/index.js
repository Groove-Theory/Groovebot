const Discord = require('discord.js');
const ErrorHandler = require('./ErrorHandler.js')
const Globals = require('./Globals.js')
const Options = require('./Options.js')
const Database = require('./Database.js')
const ChannelListener = require('./ChannelListener.js')
const fs = require('fs');
const client = new Discord.Client();
const token = process.env.DISCORD_BOT_SECRET;
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
      console.log("I'm in: --> " + client.user.username);
      client.guilds.forEach(function (oGuild) {
        Options.CheckServerOptionsExist(client, oGuild)
      });

      ChannelListener.Init(client);

      var compliment_obj = JSON.parse(fs.readFileSync('./JSONFiles/Compliments.json', 'utf8'));
      if (compliment_obj)
        Globals.aCompliments = compliment_obj.Compliments;

    var x2 = await Globals.Database.dbo.collection("Ranks").find(
        {
        "guildID": "470626956946309144",
        "production": Globals.Environment.PRODUCTION,
        "categories.ranks": 559075046245793823
    },
        {
    "categories.ranks": 559075046245793823
}).toArray();
    console.log(x2)
    console.log('here');


    }
  }
  catch (err) {
    ErrorHandler.HandleError(client, err)
  }
});


client.login(token);
