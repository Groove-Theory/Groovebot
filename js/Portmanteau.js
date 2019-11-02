const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Portmanteau",
  "Combine two words to make a new word",
   "``<word1>`` Any word \r\n ``<word2>`` Another word",
   "",
   "``g!portmanteau Britain exit`` (this might give out Brexit)"
)

let aVowels = ["a", "e", "i", "o", "u"];

exports.Init = async function (client, msg) {
  try {
    let aMsgContents = msg.content.split(/\s+/);
    let cFirstWord = aMsgContents[1];
    let cSecondWord = aMsgContents[2];
    if(!cFirstWord || !cSecondWord)
    {
        msg.channel.send("Fam, I need to words.....");
        return;
    }
    let cNewWord = "";
    if(Math.random() > 0.5)
        cNewWord = combineWords(cFirstWord, cSecondWord);
    else
        cNewWord = combineWords(cSecondWord, cFirstWord);

    if(cNewWord)
        msg.channel.send(`${cFirstWord} + ${cSecondWord} = **${cNewWord}**`);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

function combineWords(cFrontWord, cBackWord)
{
    let cFrontPart = getRandomPartOfWord(cFrontWord, true);
    let cBackPart = getRandomPartOfWord(cBackWord, false);

    let cCombinedWord = "";
    if(aVowels.indexOf(cFrontPart[cFrontPart.length - 1]) > -1 && aVowels.indexOf(cBackPart[0]) > -1)
        cCombinedWord = vowelCollisionHandle(cFrontPart, cBackPart) 
    else
        cCombinedWord = cFrontPart + cBackPart;
    return cCombinedWord;
}

function vowelCollisionHandle(cFrontPart, cBackPart)
{
    if(Math.random() > 0.5)
    {
        return cFrontPart.substring(0, cFrontPart.length - 1) + cBackPart
    }
    else
    {
        return cFrontPart + cBackPart.substring(1);
    }
}

function getRandomPartOfWord(cStr, bFront)
{
    let aSyllables = vowelSplit(cStr)
    let iRandomIndex = Globals.getRandomInt(0, aSyllables.length- 1)
    if(bFront)
        return aSyllables.map((syllable, index) => index <= iRandomIndex ? syllable : "").join("")
    else
        return aSyllables.map((syllable, index) => index >= iRandomIndex ? syllable : "").join("")
}

function vowelSplit(cStr)
{
    return cStr.split(/(?![aeiouAEIOU]+)/g);
}