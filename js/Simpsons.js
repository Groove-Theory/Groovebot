const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");
const gifGenerator = require('frinkiac-gif-generator');
//const frinkiac = null;//require('frinkiac');

exports.oHelpText = new EmbeddedHelpText(
  "Simpsons",
  "Get a Simpsons GIF (or image) based on a quote (or string input)",
   "``<quote>`` Any quote string to search for ",
   "",
   "``g!simpsons sorry its not in packets`` ('https://frinkiac.com/video/S08E02/2xg79UbW6G9ltD1ea3cOhGm0mko=.gif')"
)


exports.Init = async function (client, msg) {
    let aData = msg.content.split(/\s+/);
    aData.shift();
    if(!aData || aData.length == 0)
    {
        msg.channel.send("You gotta give me a quote, fam")
        return;
    }

    let cString = aData.join(" ");
    var oMessage = await msg.channel.send("Ok give me a sec....")
    var cGif = await GetSimpsonsGif(cString)
    if(cGif)
        oMessage.edit(cGif)
    else
    {
        // var cPic = await GetSimpsonsImage(cString)
        // if(cPic)
        //     msg.channel.send(cPic)
        // else
        oMessage.edit(":shrug:");
    }
}

async function GetSimpsonsGif(cString)
{
    return await gifGenerator(cString)
}

async function GetSimpsonsImage(cString)
{
    var cData = await frinkiac.search(cString)
    .then(function(res) {
        if (res.status !== 200) {
            throw res;
        } else {
            return res.data;
        }
    })
    var memeURLs = data.map(frinkiac.memeMap, frinkiac); // ['https://frinkiac.com/meme/S05E03/512110?b64lines=']
    return memeURLs[0];
}