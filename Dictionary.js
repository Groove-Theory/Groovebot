const RandomWord = require('random-word');
const WordDefinition = require('word-definition');
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js')
var iTries = 0;
exports.Init = function(client, msg)
{      
  var msgChannel = client.channels.get(msg.channel.id); 
  var aMsgContent = msg.content.split(" ")
  var cMsgData = aMsgContent && aMsgContent.length > 0 ? aMsgContent[1] : "";
  var cQueried = cMsgData.replace(/\b\w/g, l => l.toUpperCase())

  
  if(cQueried && cQueried.length > 0)
  {

    var cRandomWord = RandomWord();
    console.log(cRandomWord);
    getDefinition(client, cRandomWord, cQueried, msgChannel)
  }
}

function getDefinition(client, cWord, cQueried, msgChannel)
{
  WordDefinition.getDef(cWord, "en", null, function(definition) {
    try
    {
      var oJSON = definition;
      if(oJSON.err)
      {
        console.log("it worked")
        iTries++;
        if(iTries < 10)
          getDefinition(client, RandomWord(), cQueried, msgChannel);
      }
      else
      {
        printDefinition(oJSON, cQueried, msgChannel)
      }
    }
    catch(err)
    {
      ErrorHandler.HandleError(client, err);
    }
  });
}

function printDefinition(oDefinition, cQueried, msgChannel)
{
  setTimeout(function(){ 
        var cRetMsg = "";
        cRetMsg += "**" + cQueried+ "**"
        cRetMsg += " *(" + oDefinition.category + ")* - "
        cRetMsg += oDefinition.definition
        msgChannel.send(cRetMsg);
      }, 2000);
}



