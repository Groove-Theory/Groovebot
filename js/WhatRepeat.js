const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');

const aWhatWords = [
    "what",
    "what?",
    "wut",
    "wut?",
    "wat",
    "wat?",
    "wh",
    "wh?"
]
exports.ProcessMessage = function(client, msg) {
    try
    {
        var aWhatMessagesFound = aWhatWords.find(w => w.toLowerCase() == msg.content.toLowerCase());
        if(aWhatMessagesFound && aWhatMessagesFound.length > 0)
        {
            var iWhatMsgID = msg.id;
            msg.channel.fetchMessages({ limit: 100 }).then((messages) => {
                console.log(iWhatMsgID);
            var aMessages= Array.from(messages);
            var iWhatIndex = aMessages.findIndex(elem => elem[0] == iWhatMsgID)
            var aRepeatMessageMap = aMessages[iWhatIndex + 1]
            var oRepeatMessage = aRepeatMessageMap[1]
            if(oRepeatMessage)
            {
                writeOutput(msg, oRepeatMessage)
            }

            }).catch(ErrorHandler.HandleError(client, err));
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }

}

function writeOutput(oWhatMessage, oRepeatMessage)
{
    let cContent = `Dear <@${oWhatMessage.author.id}>, \r\n ` +
    `It has come to my attention when you asked '${oWhatMessage.content}', that you needed clarifiction on the last message ` +
    "Therefore, I will provide you with all the information for the last message \r\n\r\n" +
    `Message Author: ${oRepeatMessage.author.username} \r\n` +
    `Message Date: ${oRepeatMessage.createdAt} \r\n` +
    `Message Content:** ${oRepeatMessage.content} **\r\n` +
    `Message ID: ${oRepeatMessage.id} \r\n\r\n` +
    "Have a good day!";
    oWhatMessage.channel.send(
        cContent
    )
}