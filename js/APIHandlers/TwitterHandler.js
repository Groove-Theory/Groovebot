var Twitter = require('twitter');
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const fetch = require("node-fetch");
const { Autohook } = require('twitter-autohook');
exports.InitTwitterHandler = async function(){

    let LoginInfo = {
      consumer_key: process.env.TwitterConsumerKey,
      consumer_secret: process.env.TwitterConsumerSecret,
      access_token_key: process.env.TwitterAccessToken,
      access_token_secret: process.env.TwitterAccessTokenSecret,
    }

    let TwitterApi = new Twitter(LoginInfo);
    Globals.TwitterApi = TwitterApi
    await initWebhook();
    
    console.log("Twitter Loaded!");
}


async function initWebhook()
{
    const webhook = new Autohook({
        token: process.env.TwitterAccessToken,
        token_secret: process.env.TwitterAccessTokenSecret,
        consumer_key: process.env.TwitterConsumerKey,
        consumer_secret: process.env.TwitterConsumerSecret,
        env: 'dev',
        port:1337
    });
    // Removes existing webhooks
    await webhook.removeWebhooks();        
    // Starts a server and adds a new webhook
    await webhook.start();      
    // Subscribes to your own user's activity
    await webhook.subscribe({oauth_token: process.env.TwitterAccessToken, oauth_token_secret: process.env.TwitterAccessTokenSecret});  
    Globals.TwitterApiWebhook = webhook;
}
