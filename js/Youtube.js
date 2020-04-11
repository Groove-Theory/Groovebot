const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const ytsr = require('ytsr');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");
const fetch = require("node-fetch");

exports.oGetVideoText = new EmbeddedHelpText(
  "youtube",
  "Search for a Youtube Video",
   "``<search string>`` string to look up",
   "",
   "``g!yt cats`` (gets a youtube video about cats)"
)


async function GetVideo(client, msg)
{
  try {
    let aMsgContents = msg.content.split(/\s+/);
    aMsgContents.shift();
    let cSearchString = aMsgContents.join(" ")
    if(!cSearchString)
    {
      msg.channel.send("I need a search string");
      return
    }
    
    let cYoutubeID = await fetchYoutubeID(cSearchString);
    let cLink = GetYoutubeURLFromID(cYoutubeID);
    msg.channel.send(cLink)
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}
exports.GetVideo = GetVideo;

async function fetchYoutubeID(cString)
{
    var oData = await Globals.youtubeApi.search.list({part:'id', q: cString, maxResults: 1})

    var oPromise = new Promise(function(resolve) {
        fetch(oData.uri.href)
        .then(res => res.json())
        .then(async function(json){
            if(json.items && json.items.length > 0)
                resolve(json.items[0].id.videoId);
            else
                resolve("");
        });
      });

    
    return oPromise;
}

function GetYoutubeURLFromID(cID)
{
    return `https://www.youtube.com/watch?v=${cID}`;
}

