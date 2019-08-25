const Globals = require('./Globals.js')
const Vote = require('./Vote.js')
const GrooveQuote = require('./GrooveQuote.js')
const Help = require('./Help.js')
const Ventriloquist = require('./Ventriloquist.js')
const Dictionary = require('./Dictionary.js')
const Compliment = require('./Compliment.js')
const Nickname = require('./Nickname.js')
const Idiom = require('./Idiom.js')
const KeySmash = require('./KeySmash.js')
const Options = require('./Options.js')
const Ranks = require('./Ranks.js')
const ErrorHandler = require('./ErrorHandler.js')

exports.ProcessMessage = async function(client, msg) {
    try
    {
        let cCommandPrefix = "g!"
        if(Globals.Environment.PRODUCTION)
            cCommandPrefix = "g!"
        else if(Globals.Environment.TESTING)
            cCommandPrefix = "gt!"
        else if(Globals.Environment.STAGE)
            cCommandPrefix = "gs!"

        if (msg.author.id != client.user.id) {
            var msgChannel = client.channels.get(msg.channel.id);
            var msgText = msg.content;
            var aMsgWords = msgText.split(" ");
            var cMsgCommand = aMsgWords && aMsgWords.length > 0 ? aMsgWords[0] : null;
            switch (cMsgCommand) {
                case cCommandPrefix + "help":
                    Help.Init(client, msg);
                    break;
                case cCommandPrefix + "vote":
                    Vote.VoteSetup(client, msg);
                    break;
                case cCommandPrefix + "getcode":
                    msg.channel.send(Globals.g_GitLink);
                    break;
                case cCommandPrefix + "idiom":
                    Idiom.Init(client, msg);
                    break;
                case cCommandPrefix + "keysmash":
                    KeySmash.Init(client, msg);
                    break;
                case cCommandPrefix + "quoteupload":
                    GrooveQuote.Upload(client, msg);
                    break;
                case cCommandPrefix + "quote":
                    GrooveQuote.Init(client, msg);
                    break;
                case cCommandPrefix + "ventriloquist":
                    Ventriloquist.Change(client, msg);
                    break;
                case cCommandPrefix + "compliment":
                    Compliment.Init(client, msg);
                    break;
                case cCommandPrefix + "nickname":
                    Nickname.Init(client, msg);
                    break;
                case cCommandPrefix + "options":
                    Options.Init(client, msg);
                    break;
                case cCommandPrefix + "makequote":
                    GrooveQuote.MakeQuote(client, msg);
                    break;
                case "t!wiki": //fall-through
                case cCommandPrefix + "define":
                    Dictionary.Init(client, msg);
                    break;
                case cCommandPrefix + "addrankcategory":
                    Ranks.HandleCategory(client, msg, Ranks.HandleType.ADD);
                    break;
                case cCommandPrefix + "removerankcategory":
                    Ranks.HandleCategory(client, msg, Ranks.HandleType.DELETE);
                    break;
                case cCommandPrefix + "renamerankcategory":
                    Ranks.HandleCategory(client, msg, Ranks.HandleType.EDIT);
                    break;
                case cCommandPrefix + "addrank":
                    Ranks.HandleCategoryRank(client, msg, Ranks.HandleType.ADD);
                    break;
                case cCommandPrefix + "removerank":
                    Ranks.HandleCategoryRank(client, msg, Ranks.HandleType.DELETE);
                    break;
                default:
                    if(cMsgCommand.indexOf(cCommandPrefix) == 0)
                        msgChannel.send("The fuck is that shit?");
                    break;
            }
        }
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err)
    }
}
