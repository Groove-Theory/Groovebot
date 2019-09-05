const Globals = require('./Globals.js')
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Keysmash",
  "Generates a random length of chatacters, smashes them keys",
   "",
   "",
   "``g!keysmash``"
)

exports.Init = function(client, msg)
{
  var length = getRandIntFromRange(10, 20)
  var smash = [];

  while (smash.length < length)
  {
    var tierchoose = getRandIntFromRange(32, 126)
    smash.push(String.fromCharCode(tierchoose))
  }

  var keysmash = smash.join("")

  var msgChannel = client.channels.get(msg.channel.id);
  msgChannel.send(keysmash);

}

function getRandItemFromArray(aArray)
{
  return aArray[Math.floor(Math.random() * aArray.length)];
}

function getRandIntFromRange(iLow, iHigh)
{
  if (iHigh < iLow)
    return 0;
  else
    return Math.round(((iHigh - iLow) * Math.random()) + iLow)
}
