const Globals = require('./Globals.js')
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
exports.ProcessMessage = function(client, ouijaChannelID, bToggleOuija) {
    if (!bToggleOuija)
        return;

    if (msg.author.id != client.user.id && msg.channel.id == ouijaChannelID) {
        var oGuild = msg.channel.guild;
        var oQueryObject = {
            guildID: oGuild.id,
            production: Globals.bProduction,
            gametype = "ouija"
        }

        Globals.Database.Query("GameData", oQueryObject).then(function(aResult) {
            var oResult = aResult && aResult.length > 0 ? aResult[0] : null;
            var paramObject = { "oResult": oResult, "msg": msg, "ouijaChannelID": ouijaChannelID };
            if (!oResult) {
                UpsertOuijaData(client, ouijaChannelID, HandleOuijaContentCallabck.bind(paramObject));
            }
            else {
                HandleOuijaContentCallabck(oResult, ouijaChannelID);
            }

        });


    }

}

function HandleOuijaContentCallback() {
    var oResult = this.oResult;
    var msg = this.msg
    var ouijaChannel = this.ouijaChannel
    HandleOuijaContent(oResult, msg, ouijaChannel)
}

function HandleOuijaContent(oResult, msg, ouijaChannel) {
    var aNewMsgIDs = oResult.aMsgIDs;
    var bNewAskType = oResult.bAskType;
    var bNewCurrentlyInQuestion = oResult.bCurrentlyInQuestion;

    if (!oResult.bCurrentlyInQuestion) {
        if (hasValidOuijaCommand(msg.content)) {
            bNewAskType = 1;
            bNewCurrentlyInQuestion = true;
            aNewMsgIDs.push(msg.id);
        }
        else if (hasValidAskGroovebotCommand(msg.content)) {
            bNewAskType = 2;
            bNewCurrentlyInQuestion = true;
            aNewMsgIDs.push(msg.id);
        }
        UpsertOuijaData(client, ouijaChannelID, aNewMsgIDs, bNewAskType, bNewCurrentlyInQuestion, oResult.iQuestionMessageID)
    }

//TODO: Finish Recursion here, and make the send promise after the assemble promise recursion is done, then upsert null data
    else if (oResult.bCurrentlyInQuestion && msg.content.toUpperCase() == "GOODBYE") {
        var cFinalMessage = assembleAndSendFinalMessage(oResult.aMsgIDs, oResult.bAskType, ouijaChannel, "");
        copyChannel.send({
            embed:
            {
                color: 3447003,
                author:
                {
                    icon_url: client.user.avatarURL
                },
                title: oQuestionMessage.content,
                description: cOuijaResultString.length > 0 ? cOuijaResultString : "(no answer given)",
                timestamp: new Date()
            }
        });

        UpsertOuijaData(client, ouijaChannelID, [], 0, false, null)

    }
    else if (oResult.bCurrentlyInQuestion) {
        aNewMsgIDs.push(msg.id);
        UpsertOuijaData(client, ouijaChannelID, aNewMsgIDs, bNewAskType, bNewCurrentlyInQuestion, oResult.iQuestionMessageID)
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

function assembleFinalMessage(aMsgIDs, bAskType, ouijaChannel, cResult) {
    var iMsgID = aMsgIDs[0];
    ouijaChannel.fetchMessage(iMsgID).then(function(msg) {
        if (!msg.deleted) {
            if (bAskType == 1 && msg.content.length == 1)
                cResult += msg.content.toUpperCase();
            else if (bAskType == 2 && msg.content.indexOf(" ") == -1)
                cResult += msg.content.toUpperCase() + " ";
        }
        aMsgIDs.shift();
        return assembleFinalMessage(aMsgIDs, bAskType, ouijaChannel, cResult)
    }).catch(console.error);

}

function resetVars() {
    cOuijaResultString = "";
    oQuestionMessage = null;
    bCurrentlyInQuestion = false;
    bAskType = 0;
}

function UpsertOuijaData(client, ouijaChannelID, aMsgIDs, bOuijaAskType, bCurrentlyInQuestion, iQuestionMessageID) {

    aMsgIDs = aMsgIDs ? aMsgIDs : [];
    bOuijaAskType = bOuijaAskType ? bOuijaAskType : 0;
    bCurrentlyInQuestion = bCurrentlyInQuestion ? bCurrentlyInQuestion : false;
    iQuestionMessageID = iQuestionMessageID ? iQuestionMessageID : 0;
    var oKeyObject = {
        guildID: ouijaChannelID,
        production: Globals.bProduction,
        gametype = "ouija"
    }

    var oInsertObject = {
        "aMsgIDs": aMsgIDs,
        "bAskType": bOuijaAskType,
        "bCurrentlyInQuestion": bCurrentlyInQuestion,
        "iQuestionMessageID": iQuestionMessageID
    };

    Globals.Database.Upsert("GameData", oKeyObject, oInsertObject);
}