const Globals = require('./Globals.js')
var cOuijaResultString = "";
var aAnswerInputMessages = [];
var oQuestionMessage = null;
var bCurrentlyInQuestion = false;
const aValidOuijaCommandStrings =  [
                                "Ask Ouija:",
                                "Ask Oujia:",
                                "Ask Ouija ",
                                "Ask Oujia ",
                                "Ask Ouija,",
                                "Ask Oujia,",
                                "AskOuija:",
                                "AskOujia:",
                                "AskOuija-",
                                "AskOujia-",
                                "AskOuija ",
                                "AskOujia ",
                                "Hey Ouija:",
                                "Hey Oujia:",
                                "Hey Ouija ",
                                "Hey Oujia ",
                                "Hey Ouija,",
                                "Hey Oujia,",
                                "Ouija:",
                                "Oujia:",
                                "Ouija ",
                                "Oujia ",
                                "Ouija,",
                                "Oujia,",
                                "AO:",
                                "Q:"
                              ];
const aValidAskGrooveBotCommandStrings =  [
                                "Hey Groovebot,",
                                "Hey Groovebot:",
                                "Hey Groovebot-",
                                "Hey Groovebot",
                                "Hey Groovebot :",
                                "Hey Groovebot ,",
                                "Hey Groovebot -",
                                "Ask Groovebot,",
                                "Ask Groovebot:",
                                "Ask Groovebot-",
                                "Ask Groovebot",
                                "Ask Groovebot :",
                                "Ask Groovebot ,",
                                "Ask Groovebot -",
                                "Hey Bot,",
                                "Hey Bot:",
                                "Hey Bot-",
                                "Hey Bot",
                                "Hey Bot :",
                                "Hey Bot ,",
                                "Hey Bot -",
                                "Ask Bot,",
                                "Ask Bot:",
                                "Ask Bot-",
                                "Ask Bot",
                                "Ask Bot :",
                                "Ask Bot ,",
                                "Ask Bot -",
                                "Groovebot,",
                                "Groovebot:",
                                "Groovebot-",
                                "Groovebot",
                                "Groovebot :",
                                "Groovebot ,",
                                "Groovebot -"
                              ];

var bAskType = 0;
exports.Init = function(client)
{
  client.on('message', msg => 
  {
    var ouijaChannelID = Globals.g_OuijaChannelID;

    if (msg.author.id != client.user.id && msg.channel.id == ouijaChannelID) 
    {
        var copyChannel = client.channels.get(ouijaChannelID);       

        if(!bCurrentlyInQuestion)
        {
          if(hasValidOuijaCommand(msg.content))
          {
            bAskType = 1;
            bCurrentlyInQuestion = true;
            oQuestionMessage = msg;
          }
          else if(hasValidAskGroovebotCommand(msg.content))
          {
            bAskType = 2;
            bCurrentlyInQuestion = true;
            oQuestionMessage = msg;
          }
        }

        else if(bCurrentlyInQuestion && msg.content.toUpperCase() == "GOODBYE" )
        {
          cOuijaResultString = assembleFinalMessage();
          copyChannel.send({embed: 
          {
            color: 3447003,
            author: 
            {
              icon_url: client.user.avatarURL
            },
            title: oQuestionMessage.content,
            description: cOuijaResultString.length > 0 ? cOuijaResultString : "(no answer given)",
            timestamp: new Date()
          }});
          resetVars();

        }
        else if(bCurrentlyInQuestion)
        {
          aAnswerInputMessages.push(msg);
          cOuijaResultString += msg.content;
        }
    }
  });

}

function hasValidOuijaCommand(cString)
{
  for (var i in aValidOuijaCommandStrings)
  {
    if(cString.toUpperCase().startsWith(aValidOuijaCommandStrings[i].toUpperCase()))
      return true;
  }
  return false;
}

function hasValidAskGroovebotCommand(cString)
{
  for (var i in aValidAskGrooveBotCommandStrings)
  {
    if(cString.toUpperCase().startsWith(aValidAskGrooveBotCommandStrings[i].toUpperCase()))
      return true;
  }
  return false;
}

function assembleFinalMessage()
{
  var cRet = "";
  var a
  for(var i in aAnswerInputMessages)
  {
    var msg = aAnswerInputMessages[i];
    if(!msg.deleted) 
    {
      if(bAskType == 1 && msg.content.length == 1)
        cRet += msg.content.toUpperCase();
      else if (bAskType == 2 && msg.content.indexOf(" ") == -1)
        cRet += msg.content.toUpperCase() + " ";
    }
  }
  aAnswerInputMessages = [];
  return cRet;
}

function resetVars()
{
  cOuijaResultString = "";
  oQuestionMessage = null;
  bCurrentlyInQuestion = false;
  bAskType = 0;
}
