//const keep_alive = require('./keep_alive.js')
const Discord = require('discord.js');


const FoyerCopy = require('./FoyerCopy.js')
const Globals = require('./Globals.js')
const CommandListener = require('./CommandListener.js')
const Ouija = require('./Ouija.js')
const Ventriloquist = require('./Ventriloquist.js')
const fs = require('fs');
const client = new Discord.Client();
const token = process.env.DISCORD_BOT_SECRET;

var bLoggedIn = false;
var bReady = false;

client.on('ready', () => {
  if(!bReady) {
    console.log("I'm in: --> " + client.user.username);

    FoyerCopy.Init(client);
    CommandListener.Init(client)
    Ouija.Init(client);
    Ventriloquist.Init(client);

    var compliment_obj = JSON.parse(fs.readFileSync('./Compliments.json', 'utf8'));
    if(compliment_obj)
      Globals.aCompliments = compliment_obj.Compliments;

    bReady = true;

  }

});

if(!bLoggedIn) {
  client.login(token);
  bLoggedIn = true;
}
