
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const GrooveTweet = require('../Classes/GrooveTweet.js');

exports.aGrooveTweetCache = [];

async function loadTweetCache()
{
    exports.aGrooveTweetCache = await getTweetsFromDB();
    let oMaxTweet = exports.aGrooveTweetCache.sort((c,d) => {return d.created_at.getTime() - c.created_at.getTime()})[0]
    let sinceID = oMaxTweet ? oMaxTweet.tweetID : null
    let oSearchOptions = {screen_name: 'Groob111111', count:3000, include_rts:false, exclude_replies:true};

    if(sinceID)
        oSearchOptions.since_id = sinceID
    loadTweetsToNumber(oSearchOptions, null, function(aNewGrooveTweets) {
        exports.aGrooveTweetCache = [...aNewGrooveTweets, ...exports.aGrooveTweetCache];
        exports.aGrooveTweetCache = exports.aGrooveTweetCache.filter((e, i) => exports.aGrooveTweetCache.findIndex(a => a["tweetID"] === e["tweetID"]) === i);
        insertNewTweetsToDB(aNewGrooveTweets);
        console.log(exports.aGrooveTweetCache.length);       
    });

}
exports.loadTweetCache = loadTweetCache;

function loadTweetsToNumber(oSearchOptions, aCurrentTweets, fCallback)
{
    iNumTweets = 3000;
    aCurrentTweets = aCurrentTweets ? aCurrentTweets : [];
    Globals.TwitterApi.get('statuses/user_timeline', oSearchOptions, function(error, tweets, response) {
        if (!error) {
            let aNewGrooveTweets = tweets.map(o => new GrooveTweet(o));

            aNewGrooveTweets.shift();
            aCurrentTweets = [...aNewGrooveTweets, ...aCurrentTweets];
            if(aNewGrooveTweets.length == 0)
                fCallback(aCurrentTweets);
            else if(aCurrentTweets.length < iNumTweets)
            {
                oSearchOptions.max_id = tweets[tweets.length - 1].id_str
                loadTweetsToNumber(oSearchOptions, aCurrentTweets, fCallback)
            }
            else
                fCallback(aCurrentTweets);
        }
    });

}

async function getTweetsFromDB()
{
    let aResult = await Globals.Database.Query("GrooveTweets", {});
    aResult = aResult.map(o => new GrooveTweet(o));
    aGrooveTweetCache = aResult
    return aGrooveTweetCache;
}

function insertNewTweetsToDB(aNewTweets)
{
    if(aNewTweets.length > 0)
        Globals.Database.dbo.collection("GrooveTweets").insertMany(aNewTweets, function(err, res)
        {
            if (err) throw err;
            console.log("Tweets Inserted");
        });
}
