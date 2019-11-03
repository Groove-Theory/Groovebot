const RandomWord = require('random-words');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Acronym",
  "Find out what an acronym means!",
   "``<acronym>`` Any acronym to decode",
   "",
   "``g!acronym lol`` (this might give out 'Laugh Out Loud')"
)

let aVowels = ["a", "e", "i", "o", "u"];

exports.Init = async function (client, msg) {
    let aInput = msg.content.split(/\s+/);
    aInput.shift();

    aInput = aInput.join("").split("");
    aInput = aInput.map(x => x.toUpperCase()).filter(x => x.charCodeAt() >= 65 && x.charCodeAt() <= 90)

    if(aInput.length == 0)
    {
        msg.channel.send("Please input an acronym. Type in ``g!help acronym`` for more info")
        return;
    }
    let cResult = decodeAcronymArray(aInput);
    let cAcronym = aInput.join(".")

    msg.channel.send(`${cAcronym} = **${cResult}**`)
}

function decoceAcronym(cInput)
{
    return decodeAcronymArray(cInput.split(""));
}

function decodeAcronymArray(aLetters)
{
    var aRes = aLetters.map(c => {
        return Globals.capitalizeString(getRandomWordWithStartingLetter(c.toLowerCase()), true);
    })
    return aRes.join(" ");
}

function getRandomWordWithStartingLetter(cStartLetter)
{
    let aWordsThatBeginWithLetter = RandomWord.wordList.filter(w => w.startsWith(cStartLetter));
    return aWordsThatBeginWithLetter[Math.floor(Math.random() * aWordsThatBeginWithLetter.length)];
}