const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oJoinHelpText = new EmbeddedHelpText(
  "Music-Add",
  "Add a youtube song to Groovebot's music queue",
   "``<youtube url>`` a link to any youtue video",
   "",
   "``g!music-add https://www.youtube.com/watch?v=dQw4w9WgXcQ`` (adds this wonderful song to the queue)"
)
exports.oLeaveHelpText = new EmbeddedHelpText(
  "Voice-Leave",
  "Makes Groovebot leave the voice channel that you're in",
   "",
   "",
   "``g!voice-leave``"
)

exports.AddToQueue = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      if(MemberIsInVoiceChannel(oMember))
      {
          oVoiceChannel.join();
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

exports.VoiceLeave = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      if(MemberIsInVoiceChannel(oMember))
      {
          oVoiceChannel.leave();
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

function MemberIsInVoiceChannel(oMember)
{
    return oMember.voiceChannel.id > 0;
}


