const SpotifyWebApi = require('spotify-web-api-node');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

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

    let oObj = await Globals.spotifyApi.getPlaylistTracks('6g84nUSjgSxJAawgd62tLl', {
        offset: iOffsetVal,
        limit: 1,
        fields: 'items'
      })

    let cSongUrl = oObj.body.items.length > 0 ? oObj.body.items[0].track.external_urls.spotify : "";

    if(cSongUrl)
    {
        msg.channel.send(cSongUrl);
    }
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
