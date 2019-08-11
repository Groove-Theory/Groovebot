const Translate = require("translate-google");
const ErrorHandler = require("./ErrorHandler.js");

function WordType(cString) {
  this.cString = cString.toLowerCase();
  this.iNum = 0;
}

function randomizeWord(cString) {
  return cString
    .split("")
    .map(function RandomizeWordMap(v) {
      const chance = Math.round(Math.random() / 1.8);
      const cRandomizedWord = chance ? v.toUpperCase() : v.toLowerCase();
      return cRandomizedWord;
    })
    .join("");
}

function randomChance(iProbDenominator) {
  const fProb = (iProbDenominator - 1) / iProbDenominator;
  return fProb > Math.random();
}

function createTextToBeTranslated(client) {
  const aWordTypes = [];
  aWordTypes.push(new WordType("uwu"));
  aWordTypes.push(new WordType("nani"));
  aWordTypes.push(new WordType("owo"));
  aWordTypes.push(new WordType("uh"));
  aWordTypes.push(new WordType("ag"));

  for (let i = 0; i < aWordTypes.length; i += 1) {
    aWordTypes[i].iNum = parseInt(Math.random() * 10, 10);
  }

  let iNoSpaceChance = 6;
  let cStringToBeTranslated = "";

  while (aWordTypes.length > 0) {
    try {
      const iRandomIndex = Math.floor(Math.random() * aWordTypes.length);
      const oRandomWordType = aWordTypes[iRandomIndex];
      const cRandomString = randomizeWord(oRandomWordType.cString);
      cStringToBeTranslated += cRandomString;

      if (randomChance(iNoSpaceChance)) {
        cStringToBeTranslated += " ";
        iNoSpaceChance = 6;
      } else {
        iNoSpaceChance += 1;
      }
      oRandomWordType.iNum -= 1;
      if (oRandomWordType.iNum <= 0) {
        aWordTypes.splice(iRandomIndex, 1);
      }
    } catch (err) {
      ErrorHandler.HandleError(client, err);
    }
  }
  return cStringToBeTranslated;
}

exports.Init = async function Init(client, msg) {
  try {
    const cWordToBeTranslated = createTextToBeTranslated();
    const res = await Translate(cWordToBeTranslated, { from: "ig", to: "en" });
    msg.channel.send(`**"${res}"**`);
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};
