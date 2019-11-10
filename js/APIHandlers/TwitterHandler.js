var Twitter = require('twitter');
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const fetch = require("node-fetch");

exports.InitTwitterHandler = async function(){

    let LoginInfo = {
      consumer_key: process.env.TwitterConsumerKey,
      consumer_secret: process.env.TwitterConsumerSecret,
      access_token_key: process.env.TwitterAccessToken,
      access_token_secret: process.env.TwitterAccessTokenSecret,
    }

    let TwitterApi = new Twitter(LoginInfo);
    Globals.TwitterApi = TwitterApi
    console.log("Twitter Loaded!");
}



