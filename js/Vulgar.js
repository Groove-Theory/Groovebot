const RandomWord = require('random-words');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Vulgar",
  "Find out how vulgar someone or something or a message is!",
   "``<user/string>`` Any user or a string. ",
   "",
   "``g!vulgar @Abby`` (Tells you how vulgar abby is)\r\n" + 
    "``g!vulgar lol`` (Tells you how vulgar the message 'lol' is)\r\n"
)

let aDescriptions = [
    {desc: "Not Vulgar", min: -Infinity, max: 10 },
    {desc: "Little A Vulgar", min: 10, max: 20 },
    {desc: "Acceptably Vulgar", min: 20, max: 30 },
    {desc: "Noticeably Vulgar", min: 30, max: 40 },
    {desc: "Uncomfortably Vulgar", min: 40, max: 50 },
    {desc: "Hot-take level Vulgar", min: 50, max: 60 },
    {desc: "Oof-level Vulgar", min: 60, max: 70 },
    {desc: "Unbearably Vulgar", min: 70, max: 80 },
    {desc: "Reddit-level Vulgar", min: 80, max: 90 },
    {desc: "P E A K   V U L G A R I T Y", min: 90, max: Infinity },
]

exports.Init = async function (client, msg) {
    let aData = msg.content.split(/\s+/);
    aData.shift();
    if(!aData || aData.length == 0)
    {
        msg.channel.send("YOU'RE VULGAR! Input something next time. Type in ``g!help vulgar`` for more info")
        return;
    }
    let cData = aData.join("");

    let iScore = AccessVulgarityScore(cData);
    let cScoreDesc = GetVulgarityString(iScore);
    let cRet = aData.join(" ");

    msg.channel.send(`I give ${cData.length > 50 ? "this" : `**${cRet}**`} a Vulgarity Score:tm: of **${iScore}%**, which is **${cScoreDesc}**`)
}

function AccessVulgarityScore(cData)
{
    return cData.split("").map(m => m.charCodeAt()).reduce((a,b) => a + b)%100
}

function GetVulgarityString(iScore)
{
    let oDesc = aDescriptions.find(x => x.min <= iScore && x.max >= iScore) 
    return oDesc ? oDesc.desc : aDescriptions[0].desc;
}