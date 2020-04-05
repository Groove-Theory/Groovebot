const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const VoiceChat = require('./VoiceChat.js');
const ytdl = require("ytdl-core");
const MusicList = require('./MusicList.js');

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
exports.oPauseHelpText = new EmbeddedHelpText(
  "Music-Pause",
  "Pauses playing the queue!",
   "",
   "",
   "``g!music-pause`` (pauses the music queue)"
)
exports.oResumeHelpText = new EmbeddedHelpText(
  "Music-Resume",
  "Resumes playing the queue!",
   "",
   "",
   "``g!music-resume`` (resumes the music queue)"
)
exports.oHistoryHelpText = new EmbeddedHelpText(
  "Music-History",
  "Gets the history from what Groovebot's been playing this session!",
   "",
   "",
   "``g!music-history`` (gets music history)"
)
exports.oSkipHelpText = new EmbeddedHelpText(
  "Music-Skip",
  "Skips the current song playing",
   "",
   "",
   "``g!music-skip`` (skips the current song)"
)

exports.AddToQueue = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let cURL = aMsgContents[1];
      let iPosition = aMsgContents[2];
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      let oSongData = await getYoutubeData(cURL);
      if(!oSongData)
      {
        msg.channel.send("I need a valid youtube URL");
        return;
      }

      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
      {
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
    msg.channel.send("Uh oh.... I goofed. Try again and see if that works.");
    ErrorHandler.HandleError(client, err);
  }
}

exports.PrintQueue = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let iPage = aMsgContents[1];
      iPage = iPage ? iPage : 1;
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      let oMessageChannel = msg.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;
      
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
      var cReturnString = `:notes: **NOW PLAYING: ${oCurrentSongData.cDescription}**, added by ${oCurrentSongData.cUserName} (${Globals.MillisecondsToTimeSymbol(oCurrentSongData.iSeconds * 1000)}) :notes:`
      
      aResult.shift();
      MusicList.WriteList(aResult, "Coming Up....", oMessageChannel);  
      msg.channel.send(cReturnString);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.NowPlaying = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;
      
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
      let oVoiceChannel = oMember.voice.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;
      
      let oVoiceConnection = VoiceChat.GetVoiceConnection(oVoiceChannel.id)
      if(!oVoiceConnection.voice.speaking)
        PlayNextSong(oMember.voice.channel.id);
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

async function PlayNextSong (iVoiceChannelID) {
  try { 
      let aResult = await getSongQueueData(iVoiceChannelID)
      if(!aResult || aResult.length == 0)
        return;
      let oVoiceConnection = VoiceChat.GetVoiceConnection(iVoiceChannelID)
      if(!oVoiceConnection)
        return;
      
      let oCurrentSongData = aResult[0];
      if(!oCurrentSongData)
        return;

      const dispatcher = oVoiceConnection.play(ytdl(oCurrentSongData.cURL, { filter:'audioonly', quality: 'highestaudio', highWaterMark: 1024 * 1024 * 10 }))
      .on('start', () => {
        dispatcher.setVolume(1);
      })
      .on('finish', async () => { // this event fires when the song has ended
        await OnSongFinished(oCurrentSongData, iVoiceChannelID);
        PlayNextSong(iVoiceChannelID);
      })
          
      dispatcher.on('error', error =>
      {
        ErrorHandler.HandleError(Globals.g_Client, error);
      });      
  }
  catch (err) {
    ErrorHandler.HandleError(Globals.g_Client, err);
  }
}
exports.PlayNextSong = PlayNextSong;

exports.SkipSong = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;

      let aResult = await getSongQueueData(oVoiceChannel.id)
      if(!aResult || aResult.length == 0)
          return;

      let oCurrentSongData = aResult[0];

      await OnSongFinished(oCurrentSongData, oVoiceChannel.id)
      PlayNextSong(oMember.voice.channel.id);
      msg.channel.send("Skipping to next song");
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.PauseQueue = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;
      
      let oVoiceConnection = VoiceChat.GetVoiceConnection(oVoiceChannel.id)
      if(!oVoiceConnection)
        return;
      
      oVoiceConnection.dispatcher.pause();
      msg.channel.send("Pausing the thingy");
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.ResumeQueue = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;
      
      let oVoiceConnection = VoiceChat.GetVoiceConnection(oVoiceChannel.id)
      if(!oVoiceConnection)
        return;
      
      oVoiceConnection.dispatcher.resume();
      msg.channel.send("Resuming the thingy");
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.GetHistory = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      let oMessageChannel = msg.channel
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;

      let aResult =await getSongQueueData(oVoiceChannel.id, true)
      if(!aResult || aResult.length == 0)
      {
        oMessageChannel.send("Sorry, no played songs")
        return;
      }

      MusicList.WriteList(aResult, "History", oMessageChannel);
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

async function getSongQueueData(iVoiceChannelId, bPlayed=false)
{
  var oQueryObject = {
    voiceChannelID: iVoiceChannelId,
    bPlayed: bPlayed,
    production: Globals.Environment.PRODUCTION,
  }
  var oSortObject = { iPosition: 1 }
  let aResult = await Globals.Database.Query("MusicQueue", oQueryObject, {}, oSortObject);
  return aResult;
}

async function OnSongFinished(oSongData, iVoiceChannelID)
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

  await Globals.Database.Upsert("MusicQueue", oKeyObject, oInsertObject);
}

function ClearMusicSession(iVoiceChannelID)
{
  var oKeyObject = {
    voiceChannelID: iVoiceChannelID
  }

  Globals.Database.Delete("MusicQueue", oKeyObject);
}
exports.ClearMusicSession = ClearMusicSession

