const SpotifyWebApi = require('spotify-web-api-node');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
//const cron = require('node-schedule');

exports.spotifyApi = {};
exports.InitSpotifyHandler = function(){
    // credentials are optional
    Globals.spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

     refreshToken();
    // var rule = new cron.RecurrenceRule();
    // rule.minute = new cron.Range(0, 59, 55);
    // cron.scheduleJob(rule, refreshToken);

}

function refreshToken()
{
    Globals.spotifyApi.clientCredentialsGrant().then(function(data) {
        Globals.spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
        ErrorHandler.HandleError(Globals.g_Client, err);
    });
}




  