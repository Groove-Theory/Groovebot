const SpotifyWebApi = require('spotify-web-api-node');
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');

exports.spotifyApi = {};
exports.InitSpotifyHandler = function(){
    // credentials are optional
    Globals.spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    refreshToken();

    let  refreshTokenInterval = setInterval(function(){ 
        refreshToken();
    }, (0.1) * 1000 * 60 );

}

function refreshToken()
{
    Globals.spotifyApi.clientCredentialsGrant().then(function(data) {
        Globals.spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
        ErrorHandler.HandleError(Globals.g_Client, err);
    });
}




