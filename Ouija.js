const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');

var cOuijaResultString = "";
var aAnswerInputMessages = [];
var oQuestionMessage = null;
var bCurrentlyInQuestion = false;
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

var bAskType = 0;
exports.ProcessMessage = async function(client, msg, iOuijaChannelID, bToggleOuija) {
    try {
     
        if (!bToggleOuija)
            return;

        if (msg.author.id != client.user.id && msg.channel.id == iOuijaChannelID) {
            var oGuild = msg.channel.guild;
            var iGuildID = oGuild.id;

            var oOuijaChannel = msg.channel;
            var oQueryObject = {
                guildID: iGuildID,
                production: Globals.Environment.PRODUCTION,
                gametype: "ouija"
            }

            var aResult = await Globals.Database.Query("GameData", oQueryObject);
            var oResult = aResult && aResult.length > 0 ? aResult[0] : null;
            var paramObject = { "client": client, "oResult": oResult, "msg": msg, "oOuijaChannel": oOuijaChannel, "iGuildID": iGuildID };
            if (!oResult) {
                UpsertOuijaData(client, iGuildID, null, null, null, HandleOuijaContentCallback.bind(paramObject));
            }
            else {
                HandleOuijaContent(client, oResult, msg, oOuijaChannel, iGuildID);
            }
        }
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
    }

}

function HandleOuijaContentCallback() {
    try {
        var client = this.client;
        var oResult = this.oResult;
        var msg = this.msg
        var ouijaChannel = this.ouijaChannel
        var iGuildID = this.iGuildID
        HandleOuijaContent(client, oResult, msg, ouijaChannel, iGuildID)
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
    }
}

function HandleOuijaContent(client, oResult, msg, ouijaChannel, iGuildID) {
    try{
        var bNewAskType = oResult && oResult.bAskType ? oResult.bAskType : 0;
        var bNewCurrentlyInQuestion = oResult && oResult.bCurrentlyInQuestion ? oResult.bCurrentlyInQuestion : false;
        var iNewQuestionMessageID = oResult && oResult.iQuestionMessageID ? oResult.iQuestionMessageID : msg.id;
        if (!oResult || !oResult.bCurrentlyInQuestion) {
            if (hasValidOuijaCommand(msg.content)) {
                bNewAskType = 1;
                bNewCurrentlyInQuestion = true;
                iNewQuestionMessageID = msg.id;
                UpsertOuijaData(client, iGuildID, bNewAskType, bNewCurrentlyInQuestion, iNewQuestionMessageID)
            }
            else if (hasValidAskGroovebotCommand(msg.content)) {
                bNewAskType = 2;
                bNewCurrentlyInQuestion = true;
                iNewQuestionMessageID = msg.id;
                UpsertOuijaData(client, iGuildID, bNewAskType, bNewCurrentlyInQuestion, iNewQuestionMessageID)
            }

        }

        //TODO: Finish Recursion here, and make the send promise after the assemble promise recursion is done, then upsert null data
        else if (oResult.bCurrentlyInQuestion && msg.content.toUpperCase() == "GOODBYE") {
            var oReturnObj = assembleFinalMessage(oResult.bAskType, ouijaChannel, oResult.iQuestionMessageID, "")
            var oQuestionMsg = oReturnObj.questionMsg
            var cOuijaResultString = oReturnObj.cResult
            ouijaChannel.send({
                embed:
                {
                    color: 3447003,
                    author:
                    {
                        icon_url: oQuestionMsg.author.avatarURL
                    },
                    title: oQuestionMsg.content,
                    description: cOuijaResultString.length > 0 ? cOuijaResultString : "(no answer given)",
                    timestamp: new Date()
                }
            });

            UpsertOuijaData(client, iGuildID, [], 0, false, null)
        }
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
    }
}

function hasValidOuijaCommand(cString) {
    for (var i in aValidOuijaCommandStrings) {
        if (cString.toUpperCase().startsWith(aValidOuijaCommandStrings[i].toUpperCase()))
            return true;
    }
    return false;
}

function hasValidAskGroovebotCommand(cString) {
    for (var i in aValidAskGrooveBotCommandStrings) {
        if (cString.toUpperCase().startsWith(aValidAskGrooveBotCommandStrings[i].toUpperCase()))
            return true;
    }
    return false;
}

function assembleFinalMessage(bAskType, ouijaChannel, iQuestionMessageID, cResult) {
    var promise = new Promise(function(resolve, reject) {
        var oQuestionMsg = null;
        ouijaChannel.fetchMessages({ limit: 100 }).then(function(messages) {
            var bPastFirstMessage = false;
            for (let aMsg of messages) {
                msg = aMsg[1];
                if (msg.id == iQuestionMessageID) {
                    oQuestionMsg = msg;
                    break;
                }
                if(!bPastFirstMessage)
                {
                    bPastFirstMessage = true;
                    continue;
                }
                if (!msg.deleted) {
                    if (bAskType == 1 && msg.content.length == 1)
                        cResult = msg.content.toUpperCase() + cResult;
                    else if (bAskType == 2 && msg.content.indexOf(" ") == -1)
                        cResult = msg.content.toUpperCase() + " " + cResult;
                }
            };
            if (oQuestionMsg) {
                var oReturnObj = { "cResult": cResult, "questionMsg": oQuestionMsg };
                resolve(oReturnObj)
            }
            else {
                ouijaChannel.fetchMessage(iQuestionMessageID).then(function(questionMsg) {
                    var oReturnObj = { "cResult": cResult, "questionMsg": questionMsg }
                    resolve(oReturnObj);
                }).catch(err => ErrorHandler.HandleError(client, err))
            }
        }).catch(err => ErrorHandler.HandleError(client, err));
    });
    return promise;
}

function resetVars() {
    cOuijaResultString = "";
    oQuestionMessage = null;
    bCurrentlyInQuestion = false;
    bAskType = 0;
}

function UpsertOuijaData(client, iGuildID, bOuijaAskType, bCurrentlyInQuestion, iQuestionMessageID, cFunc = null) {
    try{
        bOuijaAskType = bOuijaAskType ? bOuijaAskType : 0;
        bCurrentlyInQuestion = bCurrentlyInQuestion ? bCurrentlyInQuestion : false;
        iQuestionMessageID = iQuestionMessageID ? iQuestionMessageID : 0;
        var oKeyObject = {
            guildID: iGuildID,
            production: Globals.Environment.PRODUCTION,
            gametype: "ouija"
        }

        var oInsertObject = {
            "bAskType": bOuijaAskType,
            "bCurrentlyInQuestion": bCurrentlyInQuestion,
            "iQuestionMessageID": iQuestionMessageID
        };

        Globals.Database.Upsert("GameData", oKeyObject, oInsertObject, cFunc);
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
    }
}