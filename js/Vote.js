const Globals = require('./Globals.js')
const Discord = require('discord.js');
const fs = require('fs');

var aVoteData = null;//createVoterData(oSparts);
var csvContent = null;//createCSVData(aVoteData);

var csvContent = "";
var cErrorString = "";
var cLink = "";
var iMessageDelayTime = 5000;

var oCodeMaster = null;
var oGuild = null;//client.guilds.cache.get(Globals.g_GuildID);
var oSparts = null;//oGuild.roles.cache.get(Globals.g_SparticistRole).members;

var oVoteMessage = null;
var oResultContent = {"Sent": 0, "Failed": 0}
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Vote",
  "Starts a wizard to being setting up a vote (SPECIAL MOD COMMAND ONLY)",
   "",
   "",
   "``g!vote``"
)


exports.Init = function(client)
{
  console.log("starting....");

    messageUsers(client, aVoteData);

}

function createVoterData(oSparts)
{
  let aVoteData = [];
  oSparts.forEach(function(guildMember) 
  {
    let cCode = makeID(6);
    aVoteData.push({Spart: guildMember, Code: cCode});
  })
  return aVoteData;
}

function messageUsers(client, aVoteData)
{
  var i = 1;
  aVoteData.forEach(function(oData) 
  {
    setTimeout(function(){
      oData.Spart.send(
        "Hi there " + oData.Spart.user.username + ",\r\n\r\n"
        + "I'm the bot from the lib-soc server, also called 'The Gang Forms a Union'. There's an anonymous vote being held right now and I'm here to give you your anonymous code to vote! \r\n\r\n"
        + "This is your code for the election: **" + oData.Code + "**\r\n\r\n"
        + "Here is the link to vote: **" + cLink + "**\r\n\r\n"
        + "Please type/paste in the code EXACTLY how it is, thanks :heart:"
      ).catch(
        err => addToErrorString(oData.Spart.user.username, oData.Code)
      );
      oResultContent.Sent++;
      configureResultMessage(null, null, true);
    }, i * iMessageDelayTime);
    i++;
  });

  setTimeout(function(){
    handleAfterMessages();
  }, i * iMessageDelayTime);

}

function handleAfterMessages()
{
  messageResults();
  console.log("finished");
}

function deleteCSV()
{
  fs.unlink('./VoterCodes.csv', (err) => {
    if (err) throw err;
    console.log('./VoterCodes.csv was deleted');
  });
}

function addToErrorString(cUserName, cCode)
{
  cErrorString += "Couldn't send message to: " + cUserName + " (Code: " + cCode + ")\r\n";
  oResultContent.Failed++;
  configureResultMessage(null, null, true);
}

function messageResults()
{
  if(oCodeMaster && cErrorString.length > 0)
  {
    oCodeMaster.send("Hi there, unfortunately I found a couple people I couldn't send a message to. Please contact these people indivudally \r\n\r\n" + cErrorString + " \r\n -------------- ");
  }
  else if(oCodeMaster)
  {
    oCodeMaster.send("Hi there, I'm done sending out the codes and I didn't run into any errors!! \r\n\r\n" + cErrorString + " \r\n -------------- ");
  }
  else if(!oCodeMaster)
  {
    console.log("No CodeMaster Found");
  }
  configureResultMessage(null, null, true, true)

}

function messageCSV(client, aVoteData, csvContent)
{  
  fs.writeFile('./VoterCodes.csv', csvContent, (err) => {
    if(err) {
      throw err
    }
  });
  if(oCodeMaster)
  {
    oCodeMaster.send("Hello, " + oCodeMaster.user.username + "\r\n\r\n here is the CSV file for the voters and corresponding codes. You're own code should be coming from me shortly in another message... \r\n\r\n", 
    {
      file: "./VoterCodes.csv" // Or replace with FileOptions object
    }).catch(
      err => console.log(err)
    );
  }
  else
  {
    console.log("No CodeMaster Found");
  }


}

function createCSVData(aVoteData)
{
  let aColumns = ["Username", "Nickname", "User tag", "Key"];
  writeRowCSV(aColumns)

  aVoteData.forEach(function(oData) 
  {
    let aRowData = [];
    aRowData.push(oData.Spart.user.username);
    aRowData.push(oData.Spart.nickname ? oData.Spart.nickname : oData.Spart.user.username );
    aRowData.push(oData.Spart.user.username + "#" + oData.Spart.user.discriminator);
    
    aRowData.push(oData.Code);
    writeRowCSV(aRowData)
  });
  //csvContent = encodeURI(csvContent);
  return csvContent;
}

function writeRowCSV(aRowData)
{
  for(var oData in aRowData)
  {
    oData = oData.replace("\"", "\"\"");
    oData = "\"" + oData + "\""
  }
  let cRow = aRowData.join(",")
  csvContent += cRow + "\r\n";
}
function addCSVRow(csvContent, rowArray)
{
  let row = rowArray.join(",");
  csvContent += row + "\r\n";
}
function makeID(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

////////////////////////////////////////

exports.VoteSetup = function(client, msg)
{
  var bHasPermissions = msg.member.roles.cache.find(r => r.id == Globals.g_CouncilpersonRoleID) || msg.member.roles.cache.find(r => r.id == Globals.g_CodeMasterRoleID)

  if(bHasPermissions)
  {
    msg.channel.send("Hi there!! Do you want to begin the vote setup? (Y/N)");
    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
    collector.on('collect', msg => {
        if (msg.content == "Y") 
        {
          collector.stop();
          VoteSetup_ShowOfficers(client, msg);
        } 
        else if (msg.content == "N") 
        {
          collector.stop();
          msg.channel.send("Ok whatever, I didn't wanna do it anyway.... :sob:");
        }
    })
  }
  else
  {
    msg.channel.send("Sorry fam, this command can only be used by a Councilperson or CodeMaster.");
  }
}

function VoteSetup_ShowOfficers(client, msg)
{
  var cMessage = "";
  oGuild = client.guilds.cache.get(Globals.g_GuildID);
  var oOwner = oGuild.owner;
  oCodeMaster = oGuild.roles.cache.get(Globals.g_CodeMasterRoleID).members.first();

  if(!oCodeMaster)
  {
    cMessage = "Sorry, there's no CodeMaster assigned. Terminating process :sob:"
  }
  else if(Globals.Environment.PRODUCTION && oCodeMaster.user.id == oOwner.user.id)
  {
    cMessage = "Sorry, the CodeMaster can't be the same person as the Server Owner. Terminating process :sob:"
  }
  else
  {
    cMessage = "Awesome. Here are the officers I have for the vote: \r\n";
    cMessage += "**Server Owner:** " + oOwner.user.username + "\r\n"
    cMessage += "**Code Master:** " + oCodeMaster.user.username + "\r\n\r\n";
    cMessage += "Is this correct? (Y/N)";

    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
    collector.on('collect', msg => {
        if (msg.content == "Y") 
        {
          collector.stop();
          VoteSetup_SparticistCount(client, msg)
        } 
        else if (msg.content == "N") 
        {
          collector.stop();
          msg.channel.send("Ok, terminating setup process then... :sob:");
        }
        collector.stop();
    })
  }

  msg.channel.send(cMessage);

}

function VoteSetup_SparticistCount(client, msg)
{
  var cMessage = "";
  oSparts = oGuild.roles.cache.get(Globals.g_SparticistRole).members;
  cMessage += "Dank! Ok, so I am detecting ***" + oSparts.size + "*** Spartacists to send votes to. Does this seem like the correct number? You can go to #bot-spam and type in 't!role spartacist' to double check this number. (Y/N)";

  msg.channel.send(cMessage);
  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
  collector.on('collect', msg => {
      if (msg.content == "Y") 
      {
        collector.stop();
        VoteSetup_LinkSetup(client, msg);
      } 
      else if (msg.content == "N") 
      {
        collector.stop();
        msg.channel.send("Ok, terminating setup process then... :sob:");
      }
  });
}

function VoteSetup_LinkSetup(client, msg)
{
  msg.channel.send("Totally tubular! Next step... please copy paste the link to the Google Form (or whatever link you want to send to the voters (type 'EXIT' in caps to stop setup)");

  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
  collector.on('collect', msg => {
      if (msg.content == "EXIT") 
      {
        collector.stop();
        msg.channel.send("Ok, terminating setup process then... :sob:");
      }
      else
      {
        collector.stop();
        VoteSetup_EchoLink(client, msg)
      } 
        
  });
}

function VoteSetup_EchoLink(client, msg)
{
  cLink = msg.content;
  var cMessage = "";
  cMessage += "Neato! So I'm going to echo back your link. Am I returning the correct link? (Y/N) \r\n " + cLink;

  msg.channel.send(cMessage);
  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
  collector.on('collect', msg => {
    if (msg.content == "Y") 
    {
      collector.stop();
      VoteSetup_SendListAsk(client, msg)
    } 
    else if (msg.content == "N") 
    {
      collector.stop();
      msg.channel.send("Ok, terminating setup process then... :sob:");
    }
      
  });

}

function VoteSetup_SendListAsk(client, msg)
{
  msg.channel.send("Chungus! Ok.... so I think I have everything I need to begin the vote then. I will give the CodeMaster the code list for all members. Do you want me to do that now? (Y/N)");

  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 120000 });
  collector.on('collect', msg => {
    if (msg.content == "Y") 
    {
      collector.stop();
      VoteSetup_SendListConfirm(client, msg)
    } 
    else if (msg.content == "N") 
    {
      collector.stop();
      msg.channel.send("Ok, terminating setup process then... :sob:");
    }
        
  });
}

function VoteSetup_SendListConfirm(client, msg)
{

  aVoteData = createVoterData(oSparts);
  csvContent = createCSVData(aVoteData);
  messageCSV(client, aVoteData, csvContent);
  
  setTimeout(function(){
      deleteCSV();
  }, 20000);

  msg.channel.send("Groovy! I have sent the CodeMaster a CSV file of all Sparticists and their corresponsing codes. Did the CodeMaster receive this file? It may take a few seconds depending on the number of Sparticists (Y/N)");
  
  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 300000 });
  collector.on('collect', msg => {
    if (msg.content == "Y") 
    {
      collector.stop();
      VoteSetup_SendCodesAsk(client, msg)
    } 
    else if (msg.content == "N") 
    {
      collector.stop();
      msg.channel.send("Ok, terminating setup process then... :sob:");
    }
        
  });
}

function VoteSetup_SendCodesAsk(client, msg)
{

  msg.channel.send("Ok.... now comes the scary part. I'm about to go to every Spartacist and give them their codes. There is NO stopping this once you confirm. Are you ready to send out the codes? (Y/N)");

  var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 300000 });
  collector.on('collect', msg => {
    if (msg.content == "Y") 
    {
      collector.stop();
      VoteSetup_SendCodesBegin(client, msg)
    } 
    else if (msg.content == "N") 
    {
      collector.stop();
      msg.channel.send("Ok, terminating setup process then... :sob:");
    }
        
  });
}

function VoteSetup_SendCodesBegin(client, msg)
{
 
 configureResultMessage(client, msg, false);

  var cBottomMessage = 
  msg.channel.send();

  setTimeout(function(){
    messageUsers(client, aVoteData);
  }, 5000);
}

function configureResultMessage(client, msg, bEdit, bFinished)
{
  var cTopMessage = "Ok in about 5 seconds I'm gonna start it. Thanks! It will take me up to **" + Math.ceil((oSparts.size * (iMessageDelayTime/1000))/60) + "** minutes to send all the codes out. In the meantime, I'll update this message to let you know how I'm doing. Let's hope I don't fuck up\r\n\r\n";

  var cBottomContent = "**Sent:** " + oResultContent.Sent + "/" + oSparts.size + " (" + (100 * (oResultContent.Sent/oSparts.size)).toFixed(2) + "%)\r\n" 
                      + "**Success:** " + (oResultContent.Sent - oResultContent.Failed) + "/" + oSparts.size + " (" + ((100 * (oResultContent.Sent - oResultContent.Failed))/oSparts.size).toFixed(2) + "%)\r\n"

  if(bFinished)
  {
    cBottomContent += "\r\n **I'M FINISHED!!**";
    if(oResultContent.Failed)
    {
      cBottomContent += " I have sent the Code Master a list of people who I couldn't send a message to. They will have to message them manually with their codes"
    }
    else
    {
      cBottomContent += " **NO ERRORS FOUND!!** ::smile::"
    }
  }

  if(bEdit)
  {
    oVoteMessage.edit(cTopMessage + cBottomContent);
  }
  else
  {
    msg.channel.send(cTopMessage + cBottomContent).then((msg) => oVoteMessage = msg); 
  }
}




