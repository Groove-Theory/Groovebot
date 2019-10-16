const Youtube = require("youtube-api")
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const fetch = require("node-fetch");

exports.InitYoutubeHandler = async function(){
    // credentials are optional
    Youtube.authenticate({
        type: "key",
        key: process.env.YOUTUBE_API_KEY
    });
    Globals.youtubeApi = Youtube
    console.log("Youtube Loaded!");
}



