const SpotifyWebApi = require('spotify-web-api-node');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");
const fetch = require("node-fetch");

exports.oHelpText = new EmbeddedHelpText(
    "GrooveSong",
    "Get a song from Groove's playlist",
     "",
     "",
     "``g!groovesong`` (returns one of Groove's Spotify tracks)"
 )

exports.GetSong = async function (client, msg) {
// Get a playlist
    let iNumSongsInPlaylist = await getNumSongsInPlaylist('6g84nUSjgSxJAawgd62tLl');
    let iOffsetVal = getRandomOffsetValue(iNumSongsInPlaylist, 1);

    let oObj = await getRandomTrackFromPlaylist('6g84nUSjgSxJAawgd62tLl', iOffsetVal);
    let oTrack =  oObj.body.items.length > 0 ? oObj.body.items[0].track : null;
    if(oTrack)
    {
        let cArtistName = getArtistNameFromTrack(oTrack);
        let cSongName = getSongNameFromTrack(oTrack);
        let cYTSearchString = `${cArtistName}  ${cSongName} Topic`;
        let cYTURLID = await fetchYoutubeID(cYTSearchString)
        if(cYTURLID)
        {
            let cYTURL = GetYoutubeURLFromID(cYTURLID);
            msg.channel.send(cYTURL);
        }
        else
        {
            let cSongUrl = oObj.body.items.length > 0 ? oObj.body.items[0].track.external_urls.spotify : "";

            if(cSongUrl)
            {
                msg.channel.send(cSongUrl);
            }
        }
    }   
}
  
  

async function fetchYoutubeID(cString)
{
    var oData = await Globals.youtubeApi.search.list({part:'id', q: cString, maxResults: 1})

    var oPromise = new Promise(function(resolve) {
        fetch(oData.uri.href)
        .then(res => res.json())
        .then(async function(json){
            if(json.items && json.items.length > 0)
                resolve(json.items[0].id.videoId);
            else
                resolve("");
        });
      });

    
    return oPromise;
}

function GetYoutubeURLFromID(cID)
{
    return `https://www.youtube.com/watch?v=${cID}`;
}


function getSongNameFromTrack(oTrack)
{
    return oTrack.name
}

function getArtistNameFromTrack(oTrack)
{
    return oTrack.artists.map(a => a.name).join(" ")
}

async function getRandomTrackFromPlaylist(iPlaylistID, iOffsetVal)
{
    let oObj = await Globals.spotifyApi.getPlaylistTracks(iPlaylistID, {
        offset: iOffsetVal,
        limit: 1,
        fields: 'items'
      })
    return oObj;
}


async function  getNumSongsInPlaylist(iPlayListID)
{
    let oData = await Globals.spotifyApi.getPlaylist(iPlayListID)
    return oData && oData.body && oData.body.tracks ? oData.body.tracks.total : 0;
}

function getRandomOffsetValue(iTotal, iLimit)
{
    if(iTotal <= iLimit)
        return 0;
    return Math.floor(Math.random() * (iTotal - iLimit))
}
