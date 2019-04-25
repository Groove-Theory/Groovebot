const Globals = require('./Globals.js')
const Vote = require('./Vote.js')
const GrooveQuote = require('./GrooveQuote.js')
const Stuff = require('./Stuff.js')
const Help = require('./Help.js')
const Ventriloquist = require('./Ventriloquist.js')
const Dictionary = require('./Dictionary.js')
const Compliment = require('./Compliment.js')
const Nickname = require('./Nickname.js')
const RulesCharter = require('./RulesCharter.js')
exports.Init = function(client)
{
  client.on('message', msg => 
  {
    if (msg.author.id != client.user.id)
    {
      var msgChannel = client.channels.get(msg.channel.id);
      var msgText = msg.content;
      switch(msgText)
      {
        case "g!help":
          Help.Init(client, msg);
          break; 
        case "g!vote":
          Vote.VoteSetup(client, msg); 
          break; 
        case "g!getquotefile":
          GrooveQuote.GetFile(client, msg);     
          break;
        case "g!getcode":
          msg.channel.send(Globals.g_GitLink);  
          break;
        case "g!stuff":
          Stuff.Init(client, msg);     
          break;
        case "g!rules":
          RulesCharter.RulesInit(client, msg);
          break; 
        default:
          if(msgText.substring(0, 13) == "g!quoteupload")
            GrooveQuote.Upload(client, msg);  
          else if(msgText.substring(0, 7) == "g!quote")
            GrooveQuote.Init(client, msg);  
          else if(msgText.substring(0, 15) == "g!ventriloquist")
            Ventriloquist.Change(client, msg); 
          else if(msgText.substring(0, 12) == "g!compliment")
            Compliment.Init(client, msg); 
          else if(msgText.substring(0, 10) == "g!nickname")
            Nickname.Init(client, msg); 
          else if(msgText.substring(0, 6) == "t!wiki")
            Dictionary.Init(client, msg); 
          else if(msgText.substring(0,2) == "g!")
            msgChannel.send("The fuck is that shit?");
          break;
      }
    }
  });

}


