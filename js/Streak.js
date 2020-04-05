const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Streak",
  "Find a streak of a message used in a channel",
   "``<string>`` The string to find the streak for \r\n <channel> the channel to find the streak for",
   "",
   "``g!emoji-streak :sob: #test-channel`` (Find the streak of :sob: messages in #test-channel)"
)


exports.FindStreak = async function (client, msg) {
  try {
    var aMsgContents = msg.content.split(/\s+/);
    let cString = aMsgContents.filter((val, index) => index > 0 && index < aMsgContents.length -1).join(" ");
    let cChannel = aMsgContents[aMsgContents.length - 1];

    if(!cString)
    {
        msg.channel.send("Sorry, no input string was found");
        return;
    }
    let oChannel = Globals.GetChannelByInput(cChannel);
    if(!oChannel)
    {
        msg.channel.send("Sorry, channel not found");
    }

    let iStreakCount = await getStreakCount(cString, oChannel)
    msg.channel.send(`The current streak count for '${cString}' in ${oChannel.name} is ${iStreakCount}`)

  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}


async function getStreakCount(cString, oChannel) {

  let last_id = "";
  var iNumMessagesCollected = 0;
  let iMessageCount = 0;
  while (iNumMessagesCollected < 10000 ) { //Yea I'm not doing more than 10000;
      const options = { limit: 100 };
      if (last_id) {
          options.before = last_id;
      }
      const messages = await oChannel.messages.fetch(options);
      if(messages.length == 0)
        break;
      var aMessageArray = messages.array();
      var bProceedWithLoop = true;
      for(var i = 0; i < aMessageArray.length; i++)
        {
          if(aMessageArray[i].content == cString)
            iMessageCount++;
          else
          {
            bProceedWithLoop = false;
            break;
          }
            
        }
      last_id = messages.last().id;
      iNumMessagesCollected += 100;
      if(!bProceedWithLoop)
        break;

  }

  return iMessageCount;


}
