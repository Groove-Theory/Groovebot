const Discord = require('discord.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

const EnvironmentMode = process.env.ENVIRONMENT_MODE;
const Environment = {
  TESTING: EnvironmentMode == 0 || EnvironmentMode == "0",
  STAGE: EnvironmentMode == 1 || EnvironmentMode == "1",
  PRODUCTION: EnvironmentMode == 2 || EnvironmentMode == "2",
};

exports.g_WindowsMachine = process.platform == "win32";

exports.cCommandPrefix = "g!"
if(Environment.PRODUCTION)
  exports.cCommandPrefix = "g!"
else if(Environment.TESTING)
  exports.cCommandPrefix = "gt!"
else if(Environment.STAGE)
  exports.cCommandPrefix = "gs!"
exports.Environment = Environment;

const CommandTypeStrings = {
  FUN: {cname: "Fun", order: 2},
  GROOVE: {cname: "Groove", order: 3},
  GROOVEPOINTS: {cname: "Groove Points", order: 4},
  HIDDEN: {cname: "", order: -100},
  INFORMATION: {cname: "Information", order: 1},
  LIBRARY: {cname: "Library", order: 5},
  MOD: {cname: "Mod", order: 7},
  RANK: {cname: "Rank", order: 6},
};
exports.CommandTypeStrings = CommandTypeStrings;

const oHelpText = new EmbeddedHelpText(
  "Help",
  "Gets a list of  help text for command(s) that can be used for Groovebot",
   "",
   "``<command-name>``: If this argument is passed, then a more detailed help text will be presented for that command",
   "``g!help quote`` (get the help text for the ``quote`` command)"
)

///////////////////TEST VARS///////////////testing new ide/////////////////////////

exports.g_mainChannelIDs = ["595643528760262686", "570056315989262346"];
exports.g_copyChannelIDs = ["595643579867856917", "570056992002015243"];

exports.g_GuildID = "470626956946309144";
exports.g_SparticistRole = "559075046245793823"
exports.g_CodeMasterRoleID = "563795804465135644"
exports.g_CouncilpersonRoleID = "563871903203196943"

exports.g_OuijaChannelID = "558156350320803851"

exports.g_VentriloquistInputChannelID = "595634269599039539"
exports.g_VentriloquistOutputChannelID = "570056315989262346"

///////////////////PRODUCTION VARS////////////////////////////////////////
if (exports.Environment.PRODUCTION)
{
  // TODO: We really need to figure out some MongoDB stuff here
  exports.g_mainChannelIDs = ["526080760101470230", "570056315989262346"];
  exports.g_copyChannelIDs = ["558159040371228683", "570056992002015243"];

  exports.g_GuildID = "526080760101470228";
  exports.g_SparticistRole = "526109092792762368" //"526109092792762368"
  exports.g_CodeMasterRoleID = "563903645104603158"
  exports.g_CouncilpersonRoleID = "526081028683726888"

  exports.g_OuijaChannelID = "559786059572183060"

  exports.g_VentriloquistInputChannelID = "561403085419839505"
  exports.g_VentriloquistOutputChannelID = "526082151062568960"

}


/////// NOT PRODUCTION DEPENDENT ///////
exports.g_Client = null;

exports.aGrooveQuotes = null;
exports.aCompliments = null;

exports.g_GrooveID = "193800300518309888";

exports.Database = null;

exports.spotifyApi = null;

const oSendSourceHelpText =  new EmbeddedHelpText(
  "GetCode",
  "Gets the Github source code for Groovebot",
   "",
   "",
   "``g!getcode``"
)
exports.oSendSourceHelpText = oSendSourceHelpText
exports.aCommandMap = [];



exports.OptionTypes = {
    "guildid": {"optiontype": "channel"},
    "production": {"optiontype": "boolean"},
    "guildname": {"optiontype": "string"},
    "toggleouija": {"optiontype": "boolean"},
    "ouijachannel": {"optiontype": "channel"},
    "copyinputchannel": {"optiontype": "channel"},
    "copyoutputchannel": {"optiontype": "channel"},
    "togglechannelcopy": {"optiontype": "boolean"},
    "silencechannels": {"optiontype": "channelarray"},
    "addroleoninvite": {"optiontype": "rolearray"},
    "addroleonapprove": {"optiontype": "rolearray"},
    "removeroleonapprove": {"optiontype": "rolearray"},
    "pinboardchannel": {"optiontype": "channel"},
    "goodgroovepointemojiids": {"optiontype": "emojiarray"},
    "badgroovepointemojiids": {"optiontype": "emojiarray"},
}



function SendSource(client, msg)
{
  msg.channel.send("https://github.com/Groove-Theory/Groovebot");
}
exports.SendSource = SendSource

function GetChannelByInput(cInput)
{
  let cCleanID = "";
  let cCheckMethod = "";
  let oChannel = null;
  if(cInput.startsWith(`<#`))
  {
    cCleanID = cInput.replace(/\D/g,'');
    cCheckMethod = "ID";
  }
  else if(Number.isInteger(parseInt(cInput)))
  {
    cCleanID = cInput
    cCheckMethod = "ID";
  }
  else
  {
    cCleanID = cInput
    cCheckMethod = "NAME";
  }
  if(cCheckMethod == "ID")
    oChannel = exports.g_Client.channels.find(c => c.id == cCleanID);
  else if(cCheckMethod == "NAME")
    oChannel = exports.g_Client.channels.find(c => c.name == cCleanID);

  return oChannel
}
exports.GetChannelByInput = GetChannelByInput

function getRandomInt(iMin, iMax)
{
  let min = Math.ceil(iMin);
  let max = Math.floor(iMax);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomInt = getRandomInt

function GetMemberByInput(guild, cInput)
{
  let cCleanID = "";
  let cCheckMethod = "";
  let oMember = null;
  if(cInput.startsWith(`<@`))
  {
    cCleanID = cInput.replace(/\D/g,'');
    cCheckMethod = "ID";
  }
  else if(Number.isInteger(parseInt(cInput)))
  {
    cCleanID = cInput
    cCheckMethod = "ID";
  }
  else
  {
    cCleanID = cInput
    cCheckMethod = "NAME";
  }
  if(cCheckMethod == "ID")
    oMember = guild.members.find(m => m.id == cCleanID);
  else if(cCheckMethod == "NAME")
    oMember = guild.members.find(m => m.name == cCleanID);

  return oMember
}
exports.GetMemberByInput = GetMemberByInput

function GetRoleByInput(guild, cInput)
{
  let cCleanID = "";
  let cCheckMethod = "";
  let oRole = null;
  if(cInput.startsWith(`<@&`))
  {
    cCleanID = cInput.replace(/\D/g,'');
    cCheckMethod = "ID";
  }
  else if(Number.isInteger(parseInt(cInput)))
  {
    cCleanID = cInput
    cCheckMethod = "ID";
  }
  else
  {
    cCleanID = cInput
    cCheckMethod = "NAME";
  }
  if(cCheckMethod == "ID")
    oRole = guild.roles.find(r => r.id == cCleanID);
  else if(cCheckMethod == "NAME")
    oRole = guild.roles.find(r => r.name == cCleanID);

  return oRole
}
exports.GetRoleByInput = GetRoleByInput

function GetEmojiByInput(guild, cInput)
{
  let cCleanID = "";
  let cCheckMethod = "";
  let oEmoji = null;
  if(cInput.startsWith(`<:`))
  {
    cCleanID = cInput.replace(/\D/g,'');
    cCheckMethod = "ID";
  }
  else if(Number.isInteger(parseInt(cInput)))
  {
    cCleanID = cInput
    cCheckMethod = "ID";
  }
  else
  {
    cCleanID = cInput
    cCheckMethod = "NAME";
  }
  if(cCheckMethod == "ID")
    oEmoji = guild.emojis.find(e => e.id == cCleanID);
  else if(cCheckMethod == "NAME")
  {
    oEmoji = guild.emojis.find(e => e.name == cCleanID);
    if(!oEmoji)
    {
      ;//if(!containsAlphaNumeric(cCleanID))
        //oEmoji = cCleanID;
    }
  }

  return oEmoji
}
exports.GetEmojiByInput = GetEmojiByInput

function MillisecondsToTimeString(iMilliseconds)
{
    let iDays = Math.floor(iMilliseconds/86400000);
    let iHours = Math.floor(iMilliseconds/3600000)%24;
    let iMinutes = Math.floor(iMilliseconds/60000)%60;
    let iSeconds =Math.floor(iMilliseconds/1000)%60

    return `${iDays} Days, ${iHours} Hours, ${iMinutes} Minutes, ${iSeconds} Seconds`
}
exports.MillisecondsToTimeString = MillisecondsToTimeString

function NumToSuffixedString(iVal)
{
    let aSuffixes = ["", "K", "M", "B", "T", "Q"];
    let iIndexToUse = Math.floor(Math.log(Math.abs(iVal))/Math.log(1000))
    if(iIndexToUse != 0 && !aSuffixes[iIndexToUse])
        return 0;
    return `${parseFloat(iIndexToUse > 0 ? (iVal / Math.pow(1000,iIndexToUse)).toFixed(2) : iVal)}${aSuffixes[iIndexToUse]}`.trim();
}
exports.NumToSuffixedString = NumToSuffixedString

function capitalizeString(cStr, bProper) {
  return (bProper ? cStr.toLowerCase() : cStr).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};
exports.capitalizeString = capitalizeString


function removeMentionFromString(cStr)
{
  return cStr.replace(/<@[\d\w]+>/g, "");
}

function removeEveryoneAndHereFromString(cStr)
{
  return cStr.replace("@everyone", "").replace("@here", "");
}

function cleanString(cStr, oOptions)
{
  var newStr = cStr;
  if(!oOptions || oOptions.RemoveEveryoneAndHere)
    newStr = removeEveryoneAndHereFromString(newStr)

  return newStr;
}
exports.cleanString = cleanString