const RandomWord = require('random-word');
const WordDefinition = require('word-definition');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js')
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Define",
  "Makes Groovebot try and come up with a definition for any string!",
   "``<term>`` This is any string after the command, which Groovebot will use to make a defintion for",
   "``</t>`` Type in /t at the end to get the REAL definition if possible",
   "``g!define yellow /t`` (This will get the real definition of the word 'yellow')"
)


exports.Init = function(client, msg)
{      
  let iTries = 0;
  let bTrueDefinition = false;  // default is a joke def
  let bDelay = false;

  var msgChannel = client.channels.get(msg.channel.id); 
  var aMsgContent = msg.content.split(" ")
  if(aMsgContent && aMsgContent.length > 0 && aMsgContent[aMsgContent.length - 1] == "/t")
  {
    bTrueDefinition = true;
    aMsgContent.splice(aMsgContent.length - 1, 1);
  }

  if(aMsgContent[0] == "t!wiki") // needs to come after Tatsu
  {
    bDelay = true;
  }

  aMsgContent.splice(0, 1);
  var cMsgData = aMsgContent.join(" ").trim();
  var cQueried = cMsgData.replace(/\b\w/g, l => l.toUpperCase());

  
  if(cQueried && cQueried.length > 0)
  {
    if(bTrueDefinition)
    {
      getDefinition(client, cQueried, cQueried, msgChannel, iTries, bTrueDefinition, bDelay)
    }
    else
    {
      var cRandomWord = RandomWord();
      console.log(cRandomWord);
      getDefinition(client, cRandomWord, cQueried, msgChannel, iTries, bTrueDefinition, bDelay)
    }
  }
}

function getDefinition(client, cWord, cQueried, msgChannel, iTries, bTrueDefinition, bDelay)
{
  WordDefinition.getDef(cWord, "en", null, function(definition) {
    try
    {
      var oJSON = definition;
      if(oJSON.err)
      {
        if(!bTrueDefinition)
        {
          console.log("it worked")
          iTries++;
          if(iTries < 10)
            getDefinition(client, RandomWord(), cQueried, msgChannel, iTries, bTrueDefinition, bDelay);
        }
        else
        {
          msgChannel.send("Sorry, don't know that word");
        }
      }
      else
      {
        iTries = 0;
        printDefinition(oJSON, cQueried, msgChannel, bDelay)
      }
    }
    catch(err)
    {
      ErrorHandler.HandleError(client, err);
    }
  });
}

function printDefinition(oDefinition, cQueried, msgChannel, bDelay)
{
  setTimeout(function(){ 
        var cRetMsg = "";
        cRetMsg += "**" + cQueried+ "**"
        cRetMsg += " *(" + oDefinition.category + ")* - "
        cRetMsg += oDefinition.definition
        msgChannel.send(cRetMsg);
      }, bDelay ? 2000 : 0);
}



