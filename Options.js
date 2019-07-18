const Globals = require('./Globals.js')


exports.Init = function(client, msg)
{

  var oAuthorUser = msg.author;
  if (oAuthorUser.id != Globals.g_GrooveID) // Groove override
  {
    var oGuildMembers = msg.guild.members;

    var oAuthorGuildMember = oGuildMembers.find(m => m.id == oAuthorUser.id);


    if (!oAuthorGuildMember)
    {
      console.log("the fuck, where's the user?");
      return;
    }
    else
    {
      if (!oAuthorGuildMember.hasPermission('MANAGE_GUILD'))
      {
        SendReplyMessage(client, msg, "Sorry, you need the 'Manage Server' permission to use this command :sob: ")
        return;
      }
    }
  }

  exports.CheckServerOptionsExist(client, msg.guild);

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
          name: "g!options Show <option>/'all'",
          value: "Returns the value of any option type (if already set), or type 'all' to retun all option values (if set)"
        },
        {
          name: "g!options **ToggleChannelCopy** <on/off>",
          value: "Turn on or off the Copy functionality (type 'on' or 'off' without the quotes)"
        },
        {
          name: "g!options **CopyInputChannel** <channelid>",
          value: "Sets the channel that you want to copy FROM"
        },
        {
          name: "g!options **CopyOutputChannel** <channelid>",
          value: "Sets the channel that you want to copy TO"
        },
        {
          name: "g!options **ToggleOuija** <on/off>",
          value: "Turn on or off the Ouija functionality (type 'on' or 'off' without the quotes)"
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
      case "show":
        ShowOption(client, msg, aMsgDetails);
        break;
      case "togglechannelcopy":
        ToggleChannelCopy(client, msg, aMsgDetails);
        break;
      case "copyinputchannel":
        SetCopyInputChannel(client, msg, aMsgDetails);
        break;
      case "copyoutputchannel":
        SetCopyOutputChannel(client, msg, aMsgDetails)
        break;
      case "toggleouija":
        ToggleOuija(client, msg, aMsgDetails);
        break;
      case "ouijachannel":
        SetOuijaChannel(client, msg, aMsgDetails)
        break;
      default:
        msg.channel.send("Sorry, but '" + cCommand + "' is not a valid option");
        break;
    }
  }
}

exports.CheckServerOptionsExist = function(client, oGuild)
{
  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    guildName: oGuild.name,
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject);
}

function ShowOption(client, msg, aMsgDetails)
{
  if (aMsgDetails.length != 3 || !aMsgDetails[2])
  {
    SendErrorMessage(client, msg)
    return;
  }

  var cOptionToQuery = aMsgDetails[2];

  var oGuild = msg.guild;

  var oQueryObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }


  Globals.Database.Query("ServerOptions", oQueryObject).then(function(aResult)
  {
    console.log(aResult)
    var oResult = aResult.length > 0 ? aResult[0] : null
    if (!oResult)
    {
      SendReplyMessage(client, msg, "Sorry, something went wrong (try again though, maybe this was your first time setting up options and I couldn't find anything) ");
      return;
    }

    var aDontShowProps = ["_id", "production"];
    if (cOptionToQuery.toLowerCase() == "all")
    {
      var cMessage = "";
      for (var key in oResult)
      {
        if (oResult.hasOwnProperty(key) && aDontShowProps.indexOf(key.toLowerCase()) == -1)
        {
          cMessage += "**" + key.toLowerCase() + "** = " + oResult[key] + "\r\n"

        }
      }
      SendReplyMessage(client, msg, cMessage);
    }
    else
    {
      SendReplyMessage(client, msg, "**" + cOptionToQuery.toLowerCase() + "** = " + oResult[cOptionToQuery.toLowerCase()]);
    }
  });
}

function ToggleChannelCopy(client, msg, aMsgDetails)
{
  if (aMsgDetails.length != 3 || !aMsgDetails[2] || (aMsgDetails[2].toLowerCase() != "on" && aMsgDetails[2].toLowerCase() != "off"))
  {
    SendErrorMessage(client, msg)
    return;
  }
  var bUseChannelCopy = aMsgDetails[2].toLowerCase() == "on";
  var oGuild = msg.guild;

  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    togglechannelcopy: bUseChannelCopy
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "ToggleChannelCopy successfully updated to " + aMsgDetails[2].toLowerCase()));
}

function SetCopyInputChannel(client, msg, aMsgDetails)
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

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "CopyInputChannel successfully updated to " + iCopyInputChannel));
}

function SetCopyOutputChannel(client, msg, aMsgDetails)
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

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "CopyOutputChannel successfully updated to " + iCopyOutputChannel));
}

function ToggleOuija(client, msg, aMsgDetails)
{
  if (aMsgDetails.length != 3 || !aMsgDetails[2] || (aMsgDetails[2].toLowerCase() != "on" && aMsgDetails[2].toLowerCase() != "off"))
  {
    SendErrorMessage(client, msg)
    return;
  }
  var bUseOuija = aMsgDetails[2].toLowerCase() == "on";
  var oGuild = msg.guild;

  var oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  }
  var oInsertObject = {
    toggleouija: bUseOuija
  };

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "ToggleOuija successfully updated to " + aMsgDetails[2].toLowerCase()));
}

function SetOuijaChannel(client, msg, aMsgDetails)
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

  Globals.Database.Upsert("ServerOptions", oKeyObject, oInsertObject, SendReplyMessage(client, msg, "OuijaChannel successfully updated to " + iOuijaChannel));
}


function SendErrorMessage(client, msg)
{
  msg.channel.send("Sorry, you goofed this command. Type 'g!options' for help on option setup");
}

function SendReplyMessage(client, msg, cContent)
{
  msg.channel.send(cContent);
}
