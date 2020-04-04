const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const VoiceChat = require('./VoiceChat.js');
const ytdl = require("ytdl-core");
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oAddQueueHelpText = new EmbeddedHelpText(
  "Music-Add",
  "Add a youtube song to Groovebot's music queue",
   "``<youtube url>`` a link to any youtue video",
   "",
   "``g!music-add https://www.youtube.com/watch?v=dQw4w9WgXcQ`` (adds this wonderful song to the queue)"
)
exports.oPrintQueueHelpText = new EmbeddedHelpText(
  "Music-Queue",
  "Print out the music queue!",
   "",
   "``<page>`` get the n-th page of the queue (10 per page, defaults to 1)",
   "``g!music-queue 2`` (gets the 2nd page of the queue, songs 11-20)"
)
exports.oNowPlayingHelpText = new EmbeddedHelpText(
  "Music-Now",
  "Get info for the current song!",
   "",
   "",
   "``g!music-now`` (gets info on the current song in the queue)"
)
exports.oPlayHelpText = new EmbeddedHelpText(
  "Music-Play",
  "Play what's in the queue from the top!",
   "",
   "",
   "``g!music-play`` (plays from the top of the queue)"
)
exports.oStopHelpText = new EmbeddedHelpText(
  "Music-Stop",
  "Stops playing the queue!",
   "",
   "",
   "``g!music-stop`` (gets info on the current song in the queue)"
)

exports.AddToQueue = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let cURL = aMsgContents[1];
      let iPosition = aMsgContents[2];
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      let oSongData = await getYoutubeData(cURL);
      if(!oSongData)
      {
        msg.channel.send("I need a valid youtube URL");
        return;
      }
      if(!VoiceChat.MemberIsInVoiceChannel(oMember, true) || !cURL)
      {
        msg.channel.send("You and I must be in a voice channel first");
        return;
      }

      if(!iPosition)
        iPosition = await getMaxPositionOfChannelQueue(oVoiceChannel.id) + 1
      var oKeyObject = {
        voiceChannelID: oVoiceChannel.id,
        production: Globals.Environment.PRODUCTION,
        cURL: cURL
      }
      var oInsertObject = {
        iPosition: iPosition,
        bPlayed: false,
        cDescription: oSongData.title,
        iSeconds: parseInt(oSongData.length_seconds),
        cUserName: oMember.displayName,
        cUserId: oMember.id
      };

      Globals.Database.Upsert("MusicQueue", oKeyObject, oInsertObject, (function() {
        msg.channel.send(`__Added Song:__ **${oSongData.title}** *(${Globals.MillisecondsToTimeSymbol(oSongData.length_seconds * 1000)})*`);
      })());
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.PrintQueue = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let iPage = aMsgContents[1];
      iPage = iPage ? iPage : 1;
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      if(!VoiceChat.MemberIsInVoiceChannel(oMember, true))
      {
        msg.channel.send("You and I must be in a voice channel first");
        return;
      }
      
      var oQueryObject = {
        voiceChannelID: oVoiceChannel.id,
        bPlayed: false,
        production: Globals.Environment.PRODUCTION,
      }
      var oSortObject = { iPosition: 1 }
      let aResult = await Globals.Database.Query("MusicQueue", oQueryObject, {}, oSortObject);
      if(!aResult || aResult.length == 0)
      {
        msg.channel.send("Nothing in the queue.... add moar songs!!");
        return;
      }

      let oCurrentSongData = aResult[0];
      var cReturnString = `:notes: **NOW PLAYING: ${oCurrentSongData.cDescription}**, added by ${oCurrentSongData.cUserName} (${Globals.MillisecondsToTimeSymbol(oCurrentSongData.iSeconds * 1000)}) :notes:
                            \r\n :timer: QUEUE: (page ${iPage} of ${Math.ceil(aResult.length/10)}  ) \r\n`
      for(var i = 0; i < 10; i++)
      {
        let iIndex = i*iPage;
        if(iIndex == 0)
          continue;// We already have now playing
        if(iIndex >= aResult.length)
          break;
        let oData = aResult[iIndex];
        cReturnString += `**${iIndex+1}) ${oData.cDescription}** (${Globals.MillisecondsToTimeSymbol(oData.iSeconds * 1000)})\r\n`
      }      
      msg.channel.send(cReturnString);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.NowPlaying = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      if(!VoiceChat.MemberIsInVoiceChannel(oMember, true))
      {
        msg.channel.send("You and I must be in a voice channel first");
        return;
      }
      
      let aResult =await getSongQueueData(oVoiceChannel.id)
      if(!aResult || aResult.length == 0)
      {
        msg.channel.send("Nothing in the queue.... add moar songs!!");
        return;
      }

      let oCurrentSongData = aResult[0];
      var cReturnString = `:notes: **NOW PLAYING: ${oCurrentSongData.cDescription}**, added by ${oCurrentSongData.cUserName} (${Globals.MillisecondsToTimeSymbol(oCurrentSongData.iSeconds * 1000)}) :notes: \r\n${oCurrentSongData.cURL}`
      msg.channel.send(cReturnString);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.PlayQueue = async function (client, msg) {
  try {

      var aMsgContents = msg.content.split(/\s+/);
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      if(!VoiceChat.MemberIsInVoiceChannel(oMember, true))
      {
        msg.channel.send("You and I must be in a voice channel first");
        return;
      }
      
      PlayNextSong(oMember.voiceChannel.id);
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

async function PlayNextSong (iVoiceChannelID) {
  try { 
      const streamOptions = { seek: 0, volume: 1 };
      let aResult = await getSongQueueData(iVoiceChannelID)
      if(!aResult || aResult.length == 0)
        return;
      let oVoiceConnection = VoiceChat.GetVoiceConnection(iVoiceChannelID)
      if(!oVoiceConnection)
        return;
      
      let oCurrentSongData = aResult[0];
      const stream = ytdl(oCurrentSongData.cURL, { filter : 'audioonly' });
      const dispatcher = oVoiceConnection.playStream(stream, streamOptions);

      dispatcher.on("finish", () => {
        OnSongFinished(oCurrentSongData, iVoiceChannelID);
        PlayNextSong();
      })
      .on("error", error => console.error(error));
      dispatcher.setVolume(1);
      
  }
  catch (err) {
    ErrorHandler.HandleError(Globals.g_Client, err);
  }
}
exports.PlayNextSong = PlayNextSong;

exports.StopPlayingQueue = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let oMember = msg.member;
      let oVoiceChannel = oMember.voiceChannel;
      if(!VoiceChat.MemberIsInVoiceChannel(oMember, true))
      {
        msg.channel.send("You and I must be in a voice channel first");
        return;
      }
      
      let oVoiceConnection = VoiceChat.GetVoiceConnection(oVoiceChannel.id)
      if(!oVoiceConnection)
        return;
      
      oVoiceConnection.dispatcher.end();
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

async function getMaxPositionOfChannelQueue(iVoiceChannelID)
{

  let aResults = await Globals.Database.dbo.collection("MusicQueue").aggregate([
    {
      '$match': {
        'voiceChannelID': iVoiceChannelID
      }
    }, {
      '$group': {
        '_id': '$voiceChannelID', 
        'maxPosition': {
          '$max': '$iPosition'
        }
      }
    }
    ]).toArray();

    if(aResults && aResults.length > 0)
    {
      return aResults[0].maxPosition;
    }
    else
      return 0;
}


async function getYoutubeData(url)
{
  const songInfo = await ytdl.getInfo(url);
  return songInfo;
}

async function getSongQueueData(iVoiceChannelId)
{
  var oQueryObject = {
    voiceChannelID: iVoiceChannelId,
    bPlayed: false,
    production: Globals.Environment.PRODUCTION,
  }
  var oSortObject = { iPosition: 1 }
  let aResult = await Globals.Database.Query("MusicQueue", oQueryObject, {}, oSortObject);
  return aResult;
}

function OnSongFinished(oSongData, iVoiceChannelID)
{
  var oKeyObject = {
    voiceChannelID: iVoiceChannelID,
    production: Globals.Environment.PRODUCTION,
    cURL: oSongData.cURL,
    iPosition: oSongData.iPosition
  }
  var oInsertObject = {
    bPlayed: true
  };

  Globals.Database.Upsert("MusicQueue", oKeyObject, oInsertObject);
}