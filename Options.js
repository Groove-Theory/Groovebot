const Globals = require("./Globals.js");

function SendReplyMessage(client, msg, cContent) {
  msg.channel.send(cContent);
}

function SendReplyMessageInCustomChannel(client, oChannel, cContent) {
  oChannel.send(cContent);
}

function SendErrorMessage(client, msg) {
  msg.channel.send(
    "Sorry, you goofed this command. Type 'g!options' for help on option setup"
  );
}

function AddDetailsToShowOptionsMessage(client, cMessage, oResult, key) {
  let cReturnMessage = cMessage;
  const oChannel = client.channels.find(c => c.id === oResult[key]);
  const oOptionType = Globals.OptionTypes[key];
  if (oOptionType && oOptionType.optiontype === "channel") {
    if (oChannel) cReturnMessage += ` *(${oChannel.name})*`;
  } else if (oOptionType && oOptionType.optiontype === "channelarray") {
    const aChannels = oResult && oResult[key] ? oResult[key] : [];
    if (aChannels && aChannels.length > 0) {
      cReturnMessage += " *(";
      for (let i = 0; i < aChannels.length; i += 1) {
        const oChannelFromArray = client.channels.find(
          c => c.id === oResult[key][i]
        );
        if (oChannelFromArray) {
          if (i !== 0) cReturnMessage += ", ";
          cReturnMessage += oChannelFromArray.name;
        }
      }
      cReturnMessage += ")*";
    }
  }

  return cReturnMessage;
}

async function ShowOption(client, msg, aMsgDetails) {
  if (aMsgDetails.length !== 3 || !aMsgDetails[2]) {
    SendErrorMessage(client, msg);
    return;
  }

  const cOptionToQuery = aMsgDetails[2];

  const oGuild = msg.guild;

  const oQueryObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };

  const aResult = await Globals.Database.Query(client, "ServerOptions", oQueryObject);
  console.log(aResult);
  const oResult = aResult.length > 0 ? aResult[0] : null;
  if (!oResult) {
    SendReplyMessage(
      client,
      msg,
      "Sorry, something went wrong (try again though, maybe this was your first time setting up options and I couldn't find anything) "
    );
    return;
  }
  let cMessage = "";
  const aDontShowProps = ["_id", "production"];
  if (cOptionToQuery.toLowerCase() === "all") {
    Object.keys(oResult).map(key => {
      if (aDontShowProps.indexOf(key.toLowerCase()) === -1) {
        cMessage += `**${key.toLowerCase()}** = ${oResult[key]}`;
        cMessage = AddDetailsToShowOptionsMessage(
          client,
          cMessage,
          oResult,
          key
        );
        cMessage += "\r\n";
      }
      return key;
    });
    SendReplyMessage(client, msg, cMessage);
  } else {
    cMessage = `**${cOptionToQuery.toLowerCase()}** = ${
      oResult[cOptionToQuery.toLowerCase()]
    }`;
    cMessage = AddDetailsToShowOptionsMessage(
      client,
      cMessage,
      oResult,
      cOptionToQuery.toLowerCase()
    );
    SendReplyMessage(client, msg, cMessage);
  }
}

function ToggleChannelCopy(client, msg, aMsgDetails) {
  if (
    aMsgDetails.length !== 3 ||
    !aMsgDetails[2] ||
    (aMsgDetails[2].toLowerCase() !== "on" &&
      aMsgDetails[2].toLowerCase() !== "off")
  ) {
    SendErrorMessage(client, msg);
    return;
  }
  const bUseChannelCopy = aMsgDetails[2].toLowerCase() === "on";
  const oGuild = msg.guild;

  const oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };
  const oInsertObject = {
    togglechannelcopy: bUseChannelCopy
  };

  Globals.Database.Upsert(
    client,
    "ServerOptions",
    oKeyObject,
    oInsertObject,
    SendReplyMessage(
      client,
      msg,
      `ToggleChannelCopy successfully updated to ${aMsgDetails[2].toLowerCase()}`
    )
  );
}

function SetCopyInputChannel(client, msg, aMsgDetails) {
  if (
    aMsgDetails.length !== 3 ||
    !aMsgDetails[2] ||
    !parseInt(aMsgDetails[2])
  ) {
    SendErrorMessage(client, msg);
    return;
  }
  const iCopyInputChannel = aMsgDetails[2];
  const oGuild = msg.guild;

  const oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };
  const oInsertObject = {
    copyinputchannel: iCopyInputChannel
  };

  Globals.Database.Upsert(
    client,
    "ServerOptions",
    oKeyObject,
    oInsertObject,
    SendReplyMessage(
      client,
      msg,
      `CopyInputChannel successfully updated to ${iCopyInputChannel}`
    )
  );
}

function SetCopyOutputChannel(client, msg, aMsgDetails) {
  if (
    aMsgDetails.length !== 3 ||
    !aMsgDetails[2] ||
    !parseInt(aMsgDetails[2])
  ) {
    SendErrorMessage(client, msg);
    return;
  }
  const iCopyOutputChannel = aMsgDetails[2];
  const oGuild = msg.guild;

  const oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };
  const oInsertObject = {
    copyoutputchannel: iCopyOutputChannel
  };

  Globals.Database.Upsert(
    client,
    "ServerOptions",
    oKeyObject,
    oInsertObject,
    SendReplyMessage(
      client,
      msg,
      `CopyOutputChannel successfully updated to ${iCopyOutputChannel}`
    )
  );
}

function ToggleOuija(client, msg, aMsgDetails) {
  if (
    aMsgDetails.length !== 3 ||
    !aMsgDetails[2] ||
    (aMsgDetails[2].toLowerCase() !== "on" &&
      aMsgDetails[2].toLowerCase() !== "off")
  ) {
    SendErrorMessage(client, msg);
    return;
  }
  const bUseOuija = aMsgDetails[2].toLowerCase() === "on";
  const oGuild = msg.guild;

  const oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };
  const oInsertObject = {
    toggleouija: bUseOuija
  };

  Globals.Database.Upsert(
    client,
    "ServerOptions",
    oKeyObject,
    oInsertObject,
    SendReplyMessage(
      client,
      msg,
      `ToggleOuija successfully updated to ${aMsgDetails[2].toLowerCase()}`
    )
  );
}

function SetOuijaChannel(client, msg, aMsgDetails) {
  if (
    aMsgDetails.length !== 3 ||
    !aMsgDetails[2] ||
    !parseInt(aMsgDetails[2])
  ) {
    SendErrorMessage(client, msg);
    return;
  }
  const iOuijaChannel = aMsgDetails[2];
  const oGuild = msg.guild;

  const oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };
  const oInsertObject = {
    ouijachannel: iOuijaChannel
  };

  Globals.Database.Upsert(
    client,
    "ServerOptions",
    oKeyObject,
    oInsertObject,
    SendReplyMessage(
      client,
      msg,
      `OuijaChannel successfully updated to ${iOuijaChannel}`
    )
  );
}

function ToggleSilenceChannel(client, msg, aMsgDetails) {
  if (
    aMsgDetails.length !== 4 ||
    !aMsgDetails[2] ||
    !parseInt(aMsgDetails[2]) ||
    !aMsgDetails[3]
  ) {
    SendErrorMessage(client, msg);
    return;
  }
  const iSilenceChannelID = aMsgDetails[2];
  const bAddSilenceChannel = aMsgDetails[3].toLowerCase() === "on";
  const oGuild = msg.guild;

  const oSilenceChannel = client.channels.find(c => c.id === iSilenceChannelID);

  if (!oSilenceChannel) {
    SendReplyMessage(client, msg, "Sorry, I can't find this channel");
  } else {
    const oKeyObject = {
      guildID: oGuild.id,
      production: Globals.bProduction
    };
    let oInsertObject = {};
    let cMessage = "";
    if (bAddSilenceChannel) {
      oInsertObject = {
        $addToSet: { silencechannels: iSilenceChannelID }
      };
      cMessage = `Silence Mode has been activated. All messages in this ${oSilenceChannel.name} will be auto-deleted until this is toggled off :sob:`;
    } else {
      oInsertObject = {
        $pull: { silencechannels: iSilenceChannelID }
      };
      cMessage = `Silence Mode has been de-activated for ${oSilenceChannel.name}. Messages are no longer auto-deleted :smile:`;
    }

    Globals.Database.UpsertManual(
      client,
      "ServerOptions",
      oKeyObject,
      oInsertObject,
      SendReplyMessageInCustomChannel(client, oSilenceChannel, cMessage)
    );
    if (oSilenceChannel.id !== msg.channel.id)
      SendReplyMessage(client, msg, cMessage);
  }
}

exports.Init = function Init(client, msg) {
  const oAuthorUser = msg.author;
  if (oAuthorUser.id !== Globals.g_GrooveID) {
    // Groove override
    const oGuildMembers = msg.guild.members;

    const oAuthorGuildMember = oGuildMembers.find(m => m.id === oAuthorUser.id);

    if (!oAuthorGuildMember) {
      console.log("the fuck, where's the user?");
      return;
    }

    if (!oAuthorGuildMember.hasPermission("MANAGE_GUILD")) {
      SendReplyMessage(
        client,
        msg,
        "Sorry, you need the 'Manage Server' permission to use this command :sob: "
      );
      return;
    }
  }

  exports.CheckServerOptionsExist(client, msg.guild);

  const aMsgDetails = msg.content
    .split(" ")
    .filter(function FilterGuildOptions(el) {
      return el != null && el.length > 0;
    });
  console.log(aMsgDetails);
  if (aMsgDetails.length === 1) {
    msg.channel.send({
      embed: {
        color: 3447003,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Options List",
        description:
          "Here's a list of options that you can set on your server (case insensitive)",
        fields: [
          {
            name: "g!options Show <option>/'all'",
            value:
              "Returns the value of any option type (if already set), or type 'all' to retun all option values (if set)"
          },
          {
            name: "g!options **ToggleChannelCopy** <on/off>",
            value:
              "Turn on or off the Copy functionality (type 'on' or 'off' without the quotes)"
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
            value:
              "Turn on or off the Ouija functionality (type 'on' or 'off' without the quotes)"
          },
          {
            name: "g!options **OuijaChannel** <channelid>",
            value:
              "Sets the channel that you want to have Groovebot listen to for AskOuija"
          },
          {
            name: "g!options **ToggleSilenceChannel** <channelid> <on/off>",
            value:
              "Toggle Auto-delete all incoming messages from channel (except for g!options commands)"
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "Groovebot help"
        }
      }
    });
  } else {
    const cCommand = aMsgDetails[1];
    switch (cCommand.toLowerCase()) {
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
        SetCopyOutputChannel(client, msg, aMsgDetails);
        break;
      case "toggleouija":
        ToggleOuija(client, msg, aMsgDetails);
        break;
      case "ouijachannel":
        SetOuijaChannel(client, msg, aMsgDetails);
        break;
      case "togglesilencechannel":
        ToggleSilenceChannel(client, msg, aMsgDetails);
        break;
      default:
        msg.channel.send(`Sorry, but '${cCommand}' is not a valid option`);
        break;
    }
  }
};

exports.CheckServerOptionsExist = function CheckServerOptionsExist(
  client,
  oGuild
) {
  const oKeyObject = {
    guildID: oGuild.id,
    production: Globals.bProduction
  };
  const oInsertObject = {
    guildName: oGuild.name
  };

  Globals.Database.Upsert(client, "ServerOptions", oKeyObject, oInsertObject);
};
