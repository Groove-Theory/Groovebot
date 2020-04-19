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
    aMsgContents.shift();
    if(aMsgContents.length == 0)
    {
        msg.channel.send("Fam, I need words.....");
        return;
    }
    let cNewWord = combineWordArray(aMsgContents.map(w => w.toLowerCase()));
    let cWordEqation = aMsgContents.join(" + ");
    cNewWord = Globals.cleanString(cNewWord);
    if(cNewWord)
        msg.channel.send(`${cWordEqation} = **${Globals.capitalizeString(cNewWord)}**`);
  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

function combineWordArray(aWords)
{
    let aNewWord = "";
    for(var i = 0; i < aWords.length - 1; i++)
    {
        var firstWord = i == 0 ? aWords[0] : aNewWord;
        aNewWord = combineWords(firstWord, aWords[i+1]); 
    }
    return aNewWord;
}

function combineWords(cFrontWord, cBackWord)
{
    let cFrontPart = getRandomPartOfWord(cFrontWord, true);
    let cBackPart = getRandomPartOfWord(cBackWord, false);
    cCombinedWord = cFrontPart + cBackPart;
    return cCombinedWord;
}

function getRandomPartOfWord(cStr, bFront)
{
  var aIndexes = cStr.split("").map((e, index) =>  aVowels.indexOf(e) > -1 ? index : null).filter(e => e > 0)
  var splitIndex = aIndexes[aIndexes.length * Math.random() | 0]
  if(bFront)
    return cStr.substring(0, splitIndex)
  else
    return cStr.substring(splitIndex)
}
