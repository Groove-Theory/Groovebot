const Globals = require('./Globals.js')
const Discord = require('discord.js');
const fs = require('fs');

var oUser = null;
var cLink = null;

exports.Init = function(client, msg)
{      
  var msgChannel = client.channels.get(msg.channel.id);
  var cSearch = msg.content.substring(8).trim();
  console.log(cSearch + "--");
  var iID = Globals.g_GrooveID;
  var oQuoteUser = null;
  if(cSearch.length > 0)
    oQuoteUser = FindUser(client, cSearch);

  var bError = false;
  var cErrorMessage = "";
  if(oQuoteUser)
  {
    iID = oQuoteUser.id;
  }
  else if(cSearch.length > 0)
  {
    var oMentionedUsers = msg.mentions.users;
    if(oMentionedUsers && oMentionedUsers.size > 0)
      {
        oQuoteUser = oMentionedUsers.first();
        iID = oQuoteUser.id;
      }  
    else
    {
      bError = true;
      cErrorMessage = "Sorry, couldn't find any user for a quote, so here's groove";
    }
  }


  var file = require("./GrooveQuotesList.json");
  var aQuotes = file[iID];
  if(!aQuotes || aQuotes.length == 0)
  {
    bError = true;
    cErrorMessage = "Sorry, no quotes for " + oQuoteUser.username + ", so here's groove";
    aQuotes = file[Globals.g_GrooveID];  
  }

  var cQuoteLink = aQuotes[Math.floor(Math.random() * aQuotes.length)];
  msgChannel.send(bError? cErrorMessage : "", {
            files: [
                cQuoteLink
            ]
        });


}

exports.Upload = function(client, msg)
{
  console.log(1111);
  var cMsgContent = msg.content;
  var aArgs = cMsgContent.split(" ");
  if(aArgs.length >= 3)
  {
    var cLink = aArgs[aArgs.length - 1];
    var cUser = ""
    for(var i = 1; i < aArgs.length - 1; i++)
    {
      cUser += aArgs[i] + " ";
    }
    cUser = cUser.substring(0, cUser.length - 1);
    console.log(cUser + "$$");
    if(cUser.length > 0 && cLink.length > 0)
      FindQuick(client, msg, cUser, cLink);
  }
  else
  {
    AskUser(client, msg);
  }
}   


function AskUser(client, msg, bRetry = false)
{
    console.log(2222);
  msg.channel.send({embed: 
    {
      color: 3447003,
      title: (bRetry ? "Sorry I couldn't find a user like that." : "") + "Who's screenshot quote is this? (please __don't__ use a mention)",
      description: "(type 'EXIT' to end)",
     }});
  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
  collector.on('collect', newmsg => {
      if (newmsg.content == "EXIT") 
      {
        collector.stop();
        newmsg.channel.send("Ok, terminating upload process then... :sob:");
      }
      else
      {
        collector.stop();
        ConfirmUser(client, newmsg)
      } 
        
  });
}

function FindUser(client, cSearch)
{
    console.log(3333);
  console.log(cSearch + "--");
  var oUsers = client.users;
  var oUserMaybe = null;
  oUsers.forEach(function(guildMember) 
  {
    if(!oUserMaybe && (guildMember.username.toUpperCase().indexOf(cSearch.toUpperCase()) > -1) )
    {
      oUserMaybe = guildMember;
    }
  });

  return oUserMaybe;
}

function ConfirmUser(client, msg)
{
    console.log(4444);
  var oUserMaybe = FindUser(client, msg.content);
  if(oUserMaybe)
  {
    msg.channel.send({embed: 
      {
        color: 3447003,
        author: 
          {
            name: oUserMaybe.username,
            icon_url: oUserMaybe.avatarURL
          },
        title: "Is it " + oUserMaybe.username + "? (Y/N)",
        description: "(type 'EXIT' to end)",
    }});
    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
    collector.on('collect', newmsg => {
        if (newmsg.content == "EXIT") 
        {
          collector.stop();
          newmsg.channel.send("Ok, terminating upload process then... :sob:");
        }
        else if (newmsg.content == "N") 
        {
          collector.stop();
          AskUser(client, newmsg, false)
        }
        else if (newmsg.content == "Y") 
        {
          collector.stop();
          oUser = oUserMaybe;
          AskLink(client, newmsg)
        } 
          
    });

  }
  else
    AskUser(client, msg, true)
  
}

function AskLink(client, msg, bRetry = false)
{
    console.log(5555);
    msg.channel.send({embed: 
    {
      color: 3447003,
      title: (bRetry ? "Sorry I couldn't understand the link, let's try it again..... " : "") + "What's the link to " + oUser.username + "'s screenshot?",
      description: "(type 'EXIT' to end)",
     }});
  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
  collector.on('collect', newmsg => {
      if (newmsg.content == "EXIT") 
      {
        collector.stop();
        newmsg.channel.send("Ok, terminating upload process then... :sob:");
      }
      else
      {
        collector.stop();
        ConfirmAll(client, newmsg)
      } 
        
  });
} 

function ConfirmAll(client, msg, bQuick, cLinkQuickSearch)
{
    console.log(6666);
  var cLinkMaybe = "";
  if(bQuick)
    var cLinkMaybe = cLinkQuickSearch
  else
    cLinkMaybe = msg.content;
  if(oUser && cLinkMaybe)
  {
    msg.channel.send({embed: 
    {
      color: 3447003,
      author: 
        {
          name: oUser.username,
          icon_url: oUser.avatarURL
        },
      title: "So THIS is the screenshot from " + oUser.username + "? (Y/N)\r\n",
      file: cLinkMaybe,
      description: "(type 'EXIT' to end)",
    }}).then(function(){
      var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
      collector.on('collect', newmsg => {
        if (newmsg.content == "EXIT") 
        {
          collector.stop();
          newmsg.channel.send("Ok, terminating upload process then... :sob:");
        }
        else if (newmsg.content == "N") 
        {
          collector.stop();
          AskLink(client, newmsg)
        }
        else if (newmsg.content == "Y") 
        {
          collector.stop();
          cLink = cLinkMaybe;
          AddToFile(client, msg);
        } 
            
      });
    }).catch(function(err){
          if(bQuick)
            AskUser(client, msg, true);
          else
            AskLink(client, msg, true)
        
      });;

  }
  else
  {
    if(!oUser)
      FindUser(client, msg, true)
    else
      FindLink(client, msg, true);
  }
}

function FindQuick(client, msg, cUserSearch, cLinkSearch)
{
    console.log(7777);
    cLinkSearch = cLinkSearch.trim();
    cUserSearch = cUserSearch.trim();
  var oUserMaybe = FindUser(client, cUserSearch);
  console.log(oUserMaybe);
  if(oUserMaybe)
  {
    oUser = oUserMaybe;
    ConfirmAll(client, msg, true, cLinkSearch)
  }
  else
  {
    AskUser(client, msg, true);
  }


}

function AddToFile(client, msg)
{ 
  var file = require("./GrooveQuotesList.json");
  var oUserID = oUser.id

  var aUserQuotes = file[oUserID];
  if(!aUserQuotes || aUserQuotes.length == 0)
  {
    file[oUserID] = [];
  }
  file[oUserID].push(cLink);

  fs.writeFile("./GrooveQuotesList.json", JSON.stringify(file), function (err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(file, null, 2));
    console.log("writing to file");
  });

  msg.channel.send("**FILE UPLOADED!!!**");
}
//////////////////////
//////////////////////////

exports.GetFile = function(client, msg)
{
  msg.author.send("here's the JSON file for the quote shit", 
      {
        file: "./GrooveQuotesList.json" // Or replace with FileOptions object
      }).catch(
        err => console.log(err)
      );
}   


