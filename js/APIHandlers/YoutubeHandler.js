const Youtube = require("youtube-api")
const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
const fetch = require("node-fetch");

exports.InitYoutubeHandler = async function(){
    // credentials are optional
    Youtube.authenticate({
        type: "key",
        key: "  "
    });
    Globals.youtubeApi = Youtube

    var oData2 = await Globals.youtubeApi.search.list({part:'id', q: 'Balance and Composure Revelation Topic', maxResults: 1}, function(oData){
        console.log(oData)
    })
    //console.log(oData2)

    fetch(oData2.uri.href)
    .then(res => res.json())
    .then(function(json){
        if(json.items.length > 0)
        {
            let cYoutubeUrl = `https://www.youtube.com/watch?v=${json.items[0].id.videoId}`
            console.log(cYoutubeUrl)
        }
        });
}

function printResponse(oData)
{
    console.log(oData)
}



