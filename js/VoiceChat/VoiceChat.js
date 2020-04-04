const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oJoinHelpText = new EmbeddedHelpText(
  "Voice-Join",
  "Makes Groovebot join the voice channel that you're in",
   "",
   "",
   "``g!voice-join``"
)
exports.oLeaveHelpText = new EmbeddedHelpText(
  "Voice-Leave",
  "Makes Groovebot leave the voice channel that you're in",
   "",
   "",
   "``g!voice-leave``"
)

exports.VoiceJoin = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(MemberIsInVoiceChannel(oMember, false))
      {
          oVoiceChannel.join();
          msg.channel.send(":wave: Hello, groobot is in the voice thingy");
      }
      else
      {
          msg.channel.send("You must be in a voice channel first.");
      }
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.VoiceLeave = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(MemberIsInVoiceChannel(oMember))
      {
          oVoiceChannel.leave();
          msg.channel.send("ok bai");
      }
      else
      {
          msg.channel.send("You must be in a voice channel first");
      }
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

function MemberIsInVoiceChannel(oMember, bBotCheck)
{
  var iMemberVoiceChannelID = oMember.voice && oMember.voice.channel && oMember.voice.channel.id > 0 ? oMember.voice.channel.id : -1;
  if(bBotCheck)
  {
    var oVoiceConnection = GetVoiceConnection(iMemberVoiceChannelID)
    if(!oVoiceConnection)
      return false;
  }
  return iMemberVoiceChannelID > -1;
}
exports.MemberIsInVoiceChannel = MemberIsInVoiceChannel;

function GetVoiceConnection(iMemberVoiceChannelID)
{
  var aData = Array.from(Globals.g_Client.voice.connections);
  if(!aData)
    return null;
  if(!aData[0])
    return null;
  if(!aData[0][1].channel)
    return null;
  if(aData[0][1].channel.id != iMemberVoiceChannelID)
    return null;
  return aData[0][1];
}
exports.GetVoiceConnection = GetVoiceConnection;