
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const Discord = require('discord.js');
const GrooveTweetsHandler = require("./GrooveTweetsHandler.js");
const fuzzysort = require('fuzzysort')
const EmbeddedHelpText = require("../Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Groove Tweet",
  "Get a Groove Tweet!",
   "",
   "``<search string>`` a search string to get a specific tweet (if blank, just a random tweet)",
   "``g!tweet Cheerios`` Gets a tweet that has Cheerios in it"
)

exports.Init = async function (client, msg) {
    let aData = msg.content.split(/\s+/);
    aData.shift();

    let cSearchString = aData.join(" ");
    let cTweetURL = "";
    if(!cSearchString)
        cTweetURL = getRandomTweet();
    else
        cTweetURL = searchForTweet(cSearchString);

    msg.channel.send(cTweetURL ? cTweetURL: ":shrug:")
    
}

function getRandomTweet()
{
    var oGrooveTweet = GrooveTweetsHandler.aGrooveTweetCache[Math.floor(Math.random() * GrooveTweetsHandler.aGrooveTweetCache.length)];
    return oGrooveTweet.cURL;
}
function searchForTweet(cSearchString)
{
    var aScores = fuzzysort.go(cSearchString, GrooveTweetsHandler.aGrooveTweetCache.map(o => o.text));
    let oMaxScore = aScores[0]
    let oTweet = GrooveTweetsHandler.aGrooveTweetCache.find(o => o.text == oMaxScore.target );
    if(!oTweet)
        return getRandomTweet();
    return oTweet.cURL;
}