const Youtube = require("youtube-api")
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const snoowrap = require('snoowrap');

exports.InitRedditHandler = async function(){
    // credentials are optional
    const r = new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT,
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        refreshToken: process.env.REDDIT_REFRESH_TOKEN,
    });
    Globals.redditAPI = r;

    console.log("Reddit Loaded!");
}



