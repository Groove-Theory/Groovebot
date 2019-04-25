const RandomWord = require('random-word');
const WordDefinition = require('word-definition');
const Globals = require('./Globals.js')
var iTries = 0;
exports.Init = function(client, msg)
{      
  var msgChannel = client.channels.get(msg.channel.id);    
  var cMsgData = msg.content.substring(7);
  var cQueried = cMsgData.replace(/\b\w/g, l => l.toUpperCase())

  
  if(cQueried && cQueried.length > 0)
  {

    var cRandomWord = RandomWord();
    console.log(cRandomWord);
    getDefinition(cRandomWord, cQueried, msgChannel)
  }
}

function getDefinition(cWord, cQueried, msgChannel)
{
  WordDefinition.getDef(cWord, "en", null, function(definition) {
    var oJSON = definition;
    if(oJSON.err)
    {
      console.log("it worked")
      iTries++;
      if(iTries < 10)
        getDefinition(RandomWord(), cQueried, msgChannel);
    }
    else
    {
      printDefinition(oJSON, cQueried, msgChannel)
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



