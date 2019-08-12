const Globals = require("./Globals.js");
const ErrorHandler = require("./ErrorHandler.js");

const aValidOuijaCommandStrings = [
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
const aValidAskGrooveBotCommandStrings = [
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

function hasValidOuijaCommand(cString) {
  for(var i = 0; i < aValidOuijaCommandStrings.length; i++)
  {
      let element = aValidOuijaCommandStrings[i];
      if (cString.toUpperCase().startsWith(element.toUpperCase())) return true;
  }
  return false;
}

function hasValidAskGroovebotCommand(cString) {
  for(var i = 0; i < aValidAskGrooveBotCommandStrings.length; i++)
  {
      let element = aValidAskGrooveBotCommandStrings[i];
      if (cString.toUpperCase().startsWith(element.toUpperCase())) return true;
  }
  return false;
}


function UpsertOuijaData(
  client,
  iGuildID,
  bOuijaAskType,
  bCurrentlyInQuestion,
  iQuestionMessageID,
  cFunc = null
) {
  try {
    const bOuijaAskTypeSanatizedInput = bOuijaAskType || 0;
    const bCurrentlyInQuestionSanatizedInput = bCurrentlyInQuestion || false;
    const iQuestionMessageIDSanatizedInput = iQuestionMessageID || 0;
    const oKeyObject = {
      guildID: iGuildID,
      production: Globals.bProduction,
      gametype: "ouija"
    };

    const oInsertObject = {
      bAskType: bOuijaAskTypeSanatizedInput,
      bCurrentlyInQuestion: bCurrentlyInQuestionSanatizedInput,
      iQuestionMessageID: iQuestionMessageIDSanatizedInput
    };

    Globals.Database.Upsert(client, "GameData", oKeyObject, oInsertObject, cFunc);
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

function assembleFinalMessage(
  client,
  bAskType,
  ouijaChannel,
  iQuestionMessageID,
  cResult
) {
  const promise = new Promise(function assembleFinalMessagePromise(resolve) {
    let oQuestionMsg = null;
    let cResultReturn = cResult;
    ouijaChannel
      .fetchMessages({ limit: 100 })
      .then(function assembleFinalMessagePromiseMessagesFetched(messages) {
        let bPastFirstMessage = false;
        for (const [k, v] of messages)
        {
          const msg = v;
          if (msg.id === iQuestionMessageID) {
            oQuestionMsg = msg;
            break;
          } else if (!bPastFirstMessage) {
            bPastFirstMessage = true;
          } else if (!msg.deleted) {
            if (bAskType === 1 && msg.content.length === 1)
              cResultReturn = msg.content.toUpperCase() + cResultReturn;
            else if (bAskType === 2 && msg.content.indexOf(" ") === -1)
              cResultReturn = `${msg.content.toUpperCase()} ${cResultReturn}`;
          }
        }



        if (oQuestionMsg) {
          const oReturnObj = { cResultReturn, questionMsg: oQuestionMsg };
          resolve(oReturnObj);
        } else {
          ouijaChannel
            .fetchMessage(iQuestionMessageID)
            .then(function assembleFinalQuestionFetched(questionMsg) {
              const oReturnObj = { cResultReturn, questionMsg };
              resolve(oReturnObj);
            })
            .catch(err => ErrorHandler.HandleError(client, err));
        }
      })
      .catch(err => ErrorHandler.HandleError(client, err));
  });
  return promise;
}

async function HandleOuijaContent(client, oResult, msg, ouijaChannel, iGuildID) {
  try {
    let bNewAskType = oResult && oResult.bAskType ? oResult.bAskType : 0;
    let bNewCurrentlyInQuestion =
      oResult && oResult.bCurrentlyInQuestion
        ? oResult.bCurrentlyInQuestion
        : false;
    let iNewQuestionMessageID =
      oResult && oResult.iQuestionMessageID
        ? oResult.iQuestionMessageID
        : msg.id;
    if (!oResult || !oResult.bCurrentlyInQuestion) {
      if (hasValidOuijaCommand(msg.content)) {
        bNewAskType = 1;
        bNewCurrentlyInQuestion = true;
        iNewQuestionMessageID = msg.id;
        UpsertOuijaData(
          client,
          iGuildID,
          bNewAskType,
          bNewCurrentlyInQuestion,
          iNewQuestionMessageID
        );
      } else if (hasValidAskGroovebotCommand(msg.content)) {
        bNewAskType = 2;
        bNewCurrentlyInQuestion = true;
        iNewQuestionMessageID = msg.id;
        UpsertOuijaData(
          client,
          iGuildID,
          bNewAskType,
          bNewCurrentlyInQuestion,
          iNewQuestionMessageID
        );
      }
    }

    // TODO: Finish Recursion here, and make the send promise after the assemble promise recursion is done, then upsert null data
    else if (
      oResult.bCurrentlyInQuestion &&
      msg.content.toUpperCase() === "GOODBYE"
    ) {
      const oReturnObj = await assembleFinalMessage(
        client,
        oResult.bAskType,
        ouijaChannel,
        oResult.iQuestionMessageID,
        ""
      );
      const oQuestionMsg = oReturnObj.questionMsg;
      const cOuijaResultString = oReturnObj.cResultReturn;
      ouijaChannel.send({
        embed: {
          color: 3447003,
          author: {
            icon_url: oQuestionMsg.author.avatarURL
          },
          title: oQuestionMsg.content,
          description:
            cOuijaResultString.length > 0
              ? cOuijaResultString
              : "(no answer given)",
          timestamp: new Date()
        }
      });

      UpsertOuijaData(client, iGuildID, [], 0, false, null);
    }
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}

function HandleOuijaContentCallback() {
  const { client } = this.client;
  const { oResult } = this.oResult;
  const { msg } = this.msg;
  const { ouijaChannel } = this.ouijaChannel;
  const { iGuildID } = this.iGuildID;
  try {
    HandleOuijaContent(client, oResult, msg, ouijaChannel, iGuildID);
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}
exports.ProcessMessage = async function ProcessMessage(
  client,
  msg,
  iOuijaChannelID,
  bToggleOuija
) {
  try {
    if (!bToggleOuija) return;

    if (
      msg.author.id !== client.user.id &&
      msg.channel.id === iOuijaChannelID
    ) {
      const oGuild = msg.channel.guild;
      const iGuildID = oGuild.id;

      const oOuijaChannel = msg.channel;
      const oQueryObject = {
        guildID: iGuildID,
        production: Globals.bProduction,
        gametype: "ouija"
      };

      const aResult = await Globals.Database.Query(client, "GameData", oQueryObject);
      const oResult = aResult && aResult.length > 0 ? aResult[0] : null;
      const paramObject = {
        client,
        oResult,
        msg,
        oOuijaChannel,
        iGuildID
      };
      if (!oResult) {
        UpsertOuijaData(
          client,
          iGuildID,
          null,
          null,
          null,
          HandleOuijaContentCallback.bind(paramObject)
        );
      } else {
        HandleOuijaContent(client, oResult, msg, oOuijaChannel, iGuildID);
      }
    }
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};
