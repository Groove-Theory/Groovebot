const RandomWord = require("random-word");
const WordDefinition = require("word-definition");
const ErrorHandler = require("./ErrorHandler.js");

let iTries = 0;

function printDefinition(oDefinition, cQueried, msgChannel) {
  setTimeout(function PrintDefinitionTimeout() {
    let cRetMsg = "";
    cRetMsg += `**${cQueried}**`;
    cRetMsg += ` *(${oDefinition.category})* - `;
    cRetMsg += oDefinition.definition;
    msgChannel.send(cRetMsg);
  }, 2000);
}

function getDefinition(client, cWord, cQueried, msgChannel) {
  WordDefinition.getDef(cWord, "en", null, function WordDefinitionCallback(
    definition
  ) {
    try {
      const oJSON = definition;
      if (oJSON.err) {
        iTries += 1;
        if (iTries < 10)
          getDefinition(client, RandomWord(), cQueried, msgChannel);
      } else {
        printDefinition(oJSON, cQueried, msgChannel);
      }
    } catch (err) {
      ErrorHandler.HandleError(client, err);
    }
  });
}

exports.Init = function Init(client, msg) {
  const msgChannel = client.channels.get(msg.channel.id);
  const cMsgData = msg.content.substring(7);
  const cQueried = cMsgData.replace(/\b\w/g, l => l.toUpperCase());

  if (cQueried && cQueried.length > 0) {
    const cRandomWord = RandomWord();
    getDefinition(client, cRandomWord, cQueried, msgChannel);
  }
};
