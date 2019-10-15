const SpotifyWebApi = require('spotify-web-api-node');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");



// credentials are optional
var spotifyApi = new SpotifyWebApi({
//   clientId: ' ',
//   clientSecret: ' ',
//   redirectUri: 'http://www.example.com/callback'
});

exports.oHelpText = new EmbeddedHelpText(
    "Spotify",
    "Get a song from Groove's playlist",
     "",
     "",
     "``g!spotify`` (returns a Spotify track)"
 )

exports.GetSong = async function (client, msg) {
// Get a playlist
    spotifyApi.getPlaylist('6g84nUSjgSxJAawgd62tLl')
    .then(function(data) {
        console.log('Some information about this playlist', data.body);
    }, function(err) {
        console.log('Something went wrong!', err);
    });
}