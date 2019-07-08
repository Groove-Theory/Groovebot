const Globals = require('./Globals.js')


exports.Init = function(client, msg)
{
  CheckServerOptionsExist(client, msg);
  var aMsgDetails = msg.content.split(" ").filter(function(el)
  {
    return el != null && el.length > 0;
  });
  console.log(aMsgDetails);
  if (aMsgDetails.length == 1)
  {
    msg.channel.send(
    {
      embed:
      {
        color: 3447003,
        author:
        {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Options List",
        description: "Here's a list of options that you can set on your server (case insensitive)",
        fields: [
        {
          name: "g!options **CopyInputChannel** <channelid>",
          value: "Sets the channel that you want to copy FROM"
        },
        {
          name: "g!options **CopyOutputChannel** <channelid>",
          value: "Sets the channel that you want to copy TO"
        },
        {
          name: "g!options **OuijaChannel** <channelid>",
          value: "Sets the channel that you want to have Groovebot listen to for AskOuija"
        }],
        timestamp: new Date(),
        footer:
        {
          icon_url: client.user.avatarURL,
          text: "Groovebot help"
        }
      }
    });

  }
  else
  {
    var cCommand = aMsgDetails[1];
    switch (cCommand.toLowerCase())
    {
      case "copyinputchannel":
        ToggleCopyInputChannel(client, msg, aMsgDetails);
        break;
      case "copyoutputchannel":
        ToggleCopyOutputChannel(client, msg, aMsgDetails)
        break;
      case "ouijachannel":
        ToggleOuijaChannel(client, msg, aMsgDetails)
        break;
      default:
        msg.channel.send("Sorry, but '" + cCommand + "' is not a valid option");
        break;
    }
  }
}

function CheckServerOptionsExist(client, msg)
{
  var oGuild = msg.guild;

  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    guildName: oGuild.name,
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject);
}

function ToggleCopyInputChannel(client, msg, aMsgDetails)
{
  if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2]))
  {
    SendErrorMessage(client, msg)
    return;
  }
  var iCopyInputChannel = aMsgDetails[2]
  var oGuild = msg.guild;

  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    copyinputchannel: iCopyInputChannel
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendSuccessMessage(client, msg, "CopyInputChannel successfully updated to " + iCopyInputChannel));
}

function ToggleCopyOutputChannel(client, msg, aMsgDetails)
{
  if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2]))
  {
    SendErrorMessage(client, msg)
    return;
  }
  var iCopyOutputChannel = aMsgDetails[2]
  var oGuild = msg.guild;

  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    copyoutputchannel: iCopyOutputChannel
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendSuccessMessage(client, msg, "CopyOutputChannel successfully updated to " + iCopyOutputChannel));
}

function ToggleOuijaChannel(client, msg, aMsgDetails)
{
  if (aMsgDetails.length != 3 || !aMsgDetails[2] || !parseInt(aMsgDetails[2]))
  {
    SendErrorMessage(client, msg)
    return;
  }
  var iOuijaChannel = aMsgDetails[2]
  var oGuild = msg.guild;

  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    ouijachannel: iOuijaChannel
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendSuccessMessage(client, msg, "OuijaChannel successfully updated to " + iOuijaChannel));
}


function SendErrorMessage(client, msg)
{
  msg.channel.send("Sorry, you goofed this command. Type 'g!options' for help on option setup");
}

function SendSuccessMessage(client, msg, cContent)
{
  msg.channel.send(cContent);
}
