const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const VoiceChat = require('./VoiceChat.js');
const ytdl = require("ytdl-core");
const MusicList = require('./MusicList.js');
const ytsr = require('ytsr');
const Discord = require('discord.js');
const MusicTrack = require('../Classes/MusicTrack.js');
const MusicSession = require('../Classes/MusicSession.js');

const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

const iMaxSearchResults = 50;
exports.iMaxSearchResults = iMaxSearchResults;

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
exports.oSearchText = new EmbeddedHelpText(
  "Music-Search",
  `Searches Top ${iMaxSearchResults} search results for youtube vids`,
   "<search string> the search string to get videos from. Pick one to add to the queue",
   "",
   `\`\`g!music-search JPEGMafia\`\` (gets ${iMaxSearchResults} JPEGMafia video results)`
)


exports.AddToQueueFromMessage = async function (client, msg) {
  try {
      var aMsgContents = msg.content.split(/\s+/);
      let cURL = aMsgContents[1];
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      AddSong(oMember, cURL, oVoiceChannel.id, msg.channel)

  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

async function AddSong(oMember, cURL, iVoiceChannelID, oMessageChannel)
{
  try{
    let oSongData = await getYoutubeData(cURL);

    if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, oMessageChannel, true))
      return;

    if(!oSongData)
    {
      if(oMessageChannel)
        oMessageChannel.send("I need a valid youtube URL");
      return;
    }

    var iNewTrackID = Globals.generateUniqueID();
    var oKeyObject = {
      voiceChannelID: iVoiceChannelID,
      production: Globals.Environment.PRODUCTION
    }
    var oInsertObject = { $push: { tracks: {
      trackID: iNewTrackID,
      bPlayed: false,
      cDescription: oSongData.title,
      cURL: cURL,
      iSeconds: parseInt(oSongData.length_seconds),
      cUserName: oMember.displayName,
      cUserId: oMember.id
    } } };

    Globals.Database.UpsertManual("MusicQueue", oKeyObject, oInsertObject, (function() {
      if(oMessageChannel)
        oMessageChannel.send(`__Added Song:__ **${oSongData.title}** *(${Globals.MillisecondsToTimeSymbol(oSongData.length_seconds * 1000)})*`);
        
        function AutoPlay(iTries){ 
          console.log("I'm in autoplay");
          iTries = iTries ? iTries : 0;
          getSongSessionData(iVoiceChannelID).then(aResult =>{
            let oCurrentSongData = aResult.getCurrentTrack(); 
            if(oCurrentSongData && oCurrentSongData.trackID == iNewTrackID) // If this is the only song in the queue we just inserted, play it
            {
              try{
                PlayNextSong(iVoiceChannelID);
                return true;
              }
              catch(e){
                setTimeout(function(){ AutoPlay(++iTries); }, 3000);
              }
            }
            else if (iTries < 3 && (!aResult || !aResult.tracks || aResult.tracks.length == 0 || !oCurrentSongData)) // This can't happen, which means the DB retrieval hasn't updated yet, try again in a bit
            {
              setTimeout(function(){ AutoPlay(++iTries); }, 3000);
              return false;
            }
            else if(iTries >= 3)
            {
              if(oMessageChannel)
                oMessageChannel.send("I can't auto-play the queue. Type in ``g!music-play`` to manually start the queue");
              return false;
            }
            else // Case where we're already playing
              return true;
          })
        }
        AutoPlay();
    })());
  }
  catch (err) {
    if(oMessageChannel)
      oMessageChannel.send("Uh oh.... I goofed. Try again and see if that works.");
    ErrorHandler.HandleError(Globals.g_Client, err);
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
      
      let aResult =await getSongSessionData(oVoiceChannel.id)
      let oCurrentSongData = aResult.getCurrentTrack()
      if(oCurrentSongData)
      {
        var cReturnString = `:notes: **NOW PLAYING: ${oCurrentSongData.cDescription}**, added by ${oCurrentSongData.cUserName} (${Globals.MillisecondsToTimeSymbol(oCurrentSongData.iSeconds * 1000)}) :notes:`
        msg.channel.send(cReturnString);
      }

      let aUpcomingTracks = aResult.getUpcomingTracks();
      if(aUpcomingTracks.length == 0)      
      {
        msg.channel.send("Nothing in the queue.... add moar songs!!");
        return;
      }


      MusicList.WriteList(aUpcomingTracks, "Coming Up....", oMessageChannel);  
      
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
      
      let aResult =await getSongSessionData(oVoiceChannel.id)
      if(!aResult.hasTracks())
      {
        msg.channel.send("Nothing in the queue.... add moar songs!!");
        return;
      }
      let aTracks = aResult.tracks;
      let oCurrentSongData = aResult.getCurrentTrack()
      var cReturnString = `:notes: **NOW PLAYING: ${oCurrentSongData.cDescription}**, added by ${oCurrentSongData.cUserName} (${Globals.MillisecondsToTimeSymbol(oCurrentSongData.iSeconds * 1000)}) :notes: \r\n${oCurrentSongData.cURL}`
      msg.channel.send(cReturnString);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

exports.PlayQueue = async function (client, msg) {
  try {
      let oMember = msg.member;
      let oVoiceChannel = oMember.voice.channel;
      if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
        return;
      
      let oVoiceConnection = VoiceChat.GetVoiceConnection(oVoiceChannel.id)
      //if(!oVoiceConnection.voice.speaking)
        PlayNextSong(oMember.voice.channel.id);
      
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

async function PlayNextSong (iVoiceChannelID, oPrevSong) {
  try { 
      let oVoiceConnection = VoiceChat.GetVoiceConnection(iVoiceChannelID)
      if(!oVoiceConnection)
        return;

      let aResult = await getSongSessionData(iVoiceChannelID)
      if(!aResult || aResult.length == 0)
        return;
      
      var oTextChannel = Globals.g_Client.channels.cache.find(c => c.id == aResult.textChannelID);
      let oCurrentSongData = aResult.getCurrentTrack(oPrevSong ? oPrevSong.trackID : -1);
      if(!oCurrentSongData)
      {
        oTextChannel.send("No more songs umu. Add more then type in ``g!music-play`` to restart");
      }

      const dispatcher = oVoiceConnection.play(ytdl(oCurrentSongData ? oCurrentSongData.cURL : "", { filter:'audioonly', quality: 'highestaudio', highWaterMark: 1024 * 1024 * 20 }))
      .on('start', () => {
        if(oCurrentSongData)
        {
          dispatcher.setVolume(1);
          oTextChannel.send(`:musical_note: Now Playing: **${oCurrentSongData.cDescription}**, added by __${oCurrentSongData.cUserName}__ *(${Globals.MillisecondsToTimeSymbol(oCurrentSongData.iSeconds * 1000)})*`)
        }
      })
      .on('finish', async () => { // this event fires when the song has ended
        if(oCurrentSongData)
        {
          let oPrevSong = await OnSongFinished(oCurrentSongData, iVoiceChannelID);
          PlayNextSong(iVoiceChannelID, oPrevSong);
        }
      })
          
      dispatcher.on('error', error =>
      {
        if(oCurrentSongData)
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

      let aResult = await getSongSessionData(oVoiceChannel.id)
      let oCurrentSongData = aResult.getCurrentTrack();
      if(!oCurrentSongData)
      {
        msg.channel.send("I don't think a song is playing....");
        return;
      }
      let oPrevSong = await OnSongFinished(oCurrentSongData, oVoiceChannel.id)
      msg.channel.send("Skipping to next song");
      PlayNextSong(oMember.voice.channel.id, oPrevSong);

      
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

      let aResult =await getSongSessionData(oVoiceChannel.id)
      let aPreviousTracks = aResult.getPreviousTracks();
      if(aPreviousTracks.length == 0)    
      {
        oMessageChannel.send("Sorry, no played songs")
        return;
      }

      MusicList.WriteList(aPreviousTracks, "History", oMessageChannel);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

async function getYoutubeData(url)
{
  const songInfo = await ytdl.getInfo(url);
  return songInfo;
}

async function getSongSessionData(iVoiceChannelId)
{
  var oQueryObject = {
    voiceChannelID: iVoiceChannelId,
    production: Globals.Environment.PRODUCTION,
  }
  let aResult = await Globals.Database.Query("MusicQueue", oQueryObject, {}, {});
  return new MusicSession(aResult);
}

async function OnSongFinished(oSongData, iVoiceChannelID)
{
  var oKeyObject = {
    voiceChannelID: iVoiceChannelID,
    production: Globals.Environment.PRODUCTION,
    "tracks.trackID": oSongData.trackID
  }
  var oInsertObject = {
    "tracks.$.bPlayed" : true
  };

  await Globals.Database.Upsert("MusicQueue", oKeyObject, oInsertObject);

  //await Globals.Database.UpsertManual("MusicQueue", oKeyObject, oInsertObject);

  return oSongData; // Return the position that was just deleted
}

function ClearMusicSession(iVoiceChannelID)
{
  var oKeyObject = {
    voiceChannelID: iVoiceChannelID
  }

  Globals.Database.Delete("MusicQueue", oKeyObject);
}
exports.ClearMusicSession = ClearMusicSession

async function FetchYoutubeSearchResults(client, msg, iMaxResults = iMaxSearchResults)
{

  let oMember = msg.member;
  let oVoiceChannel = oMember.voice.channel;
  let oMessageChannel = msg.channel
  if(!VoiceChat.MemberPassesVoiceChannelCheck(oMember, msg.channel, true))
    return;

  let aMsgContents = msg.content.split(/\s+/);
  aMsgContents.shift();
  let cSearchString = aMsgContents.join(" ")
  
  let filter;
  ytsr.getFilters(cSearchString, function(err, filters) {
    if(err) throw err;
    filter = filters.get('Type').find(o => o.name === 'Video');
    ytsr.getFilters(filter.ref, function(err, filters) {
      if(err) throw err;
      filter = filters.get('Duration').find(o => o.name.startsWith('Short'));
      var options = {
        limit: iMaxSearchResults,
        nextpageRef: filter.ref,
      }
      ytsr(null, options, function(err, oSearchResults) {
        if(err) throw err;
        DisplaySearchResults(oMember, oMessageChannel, oSearchResults.items, oVoiceChannel.id)
      });
    });
  });
}

function DisplaySearchResults(oMember, oMessageChannel, aSearchResults, iVoiceChannelID)
{
  let cResultsString = `Here's what I found. Please pick one by typing in the number (1-${iMaxSearchResults}), or type "stop" to cancel. \r\n\r\n`;
  let aTracks = [];
  for(var i = 0; i < aSearchResults.length; i++)
  {
    let oResult = aSearchResults[i];
    aTracks.push(new MusicTrack({
      "voiceChannelID":iVoiceChannelID,
      "cURL":oResult.link,
      "cDescription":oResult.title,
      "cDurationString":oResult.duration
    }));
  }
  MusicList.WriteList(aTracks,"Search Results", oMessageChannel, "Type in the number to the left of the list item to pick that song. \r\n Type ``stop`` to cancel the search. \r\n You can also click the left/right buttons to search through the list.");

  var collector = new Discord.MessageCollector(oMessageChannel, m => m.author.id === oMember.id, { time: 60000 });
  collector.on('collect', msg => {
    if(msg.content.toUpperCase() == "STOP")
    {
      collector.stop();
      oMessageChannel.send("Ok, stopping the search thingy");
      return;
    }

    let iSearchIndex = msg.content;
    let oResult = aSearchResults.find((r, index) => index == iSearchIndex - 1);

    if (oResult) 
    {
      collector.stop();
      oMessageChannel.send("Ok, adding song....");
      AddSong(oMember, oResult.link, iVoiceChannelID, oMessageChannel)
    } 
    else
    {
      oMessageChannel.send("Sorry, didn't work. Try again (if i stop responding, do the search command again)...");
    }
  })
}


exports.FetchYoutubeSearchResults = FetchYoutubeSearchResults