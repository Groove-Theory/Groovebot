const Globals = require('./Globals.js')
const Discord = require('discord.js');
const ErrorHandler = require('./ErrorHandler.js');
let registerFont, createCanvas, loadImage;
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.cUploadHelpText = new EmbeddedHelpText(
    "QuoteUpload",
    "Uploads a quote for g!quote (GROOVE COMMAND ONLY)",
     "``<link>`` this is a link to the quote screenshot image",
     "",
     "``g!quoteupload image.jpg``"
 )
 exports.oQuoteHelpText = new EmbeddedHelpText(
    "quote",
    "Generates a random Groove quote",
     "",
     "",
     "``g!quote``"
 )
 exports.oMakeQuoteHelpText = new EmbeddedHelpText(
    "MakeQuote",
    "Creates a fake-Groove quote screenshot of whatever text you want. This does NOT work with markdwn, emojis, or mentions.",
     "``<text>`` A string used to make the screenshot. The text will auto word-rap if necessary",
     "",
     "``g!makequote hi my name is groove``"
 )

if(false)
{
    const Canvas = require('canvas');
    registerFont = Canvas.registerFont;
    createCanvas = Canvas.createCanvas;
    loadImage = Canvas.loadImage;
}

const wrap = (s, w) => s.replace(
    /(?![^\n]{1,40}$)([^\n]{1,40})\s/g, '$1\n'
);

var cLink = null;


exports.MakeQuote = async function (client, msg) {
    try {
        if (msg.author.id == 299248686565687296)
            return true;

        if(Globals.g_WindowsMachine)
        {
            msg.channel.send("Sorry, cant use this while testing on a Windows Machine")
            return true;
        }

        var member = msg.member;

        var cContent = msg.content.substring(msg.content.indexOf(" ")).trim(); // this should get rid of the first "word" i.e command
        var aContent = cContent.split("\\r\\n");
        var aFixedContent = [];
        aContent.forEach(function (part, index, theArray) {
            var cWrappedString = wrap(part)
            var aWrappedString = cWrappedString.split("\n");
            aWrappedString.forEach(function (part, index, theArray) {
                aFixedContent.push(part);
            });
        });

        registerFont('./FontFiles/Catamaran-Medium.ttf', { family: 'Whitney' })

        const canvas = createCanvas(350, 40 + 21 * aFixedContent.length);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = "#36393f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //ctx.font = "normal normal 500 normal 70px / 70px 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 550";
        ctx.font = "bold 16px Whitney";
        ctx.fillStyle = '#ff00b1';
        ctx.fillText("Groove Theory", 70, 27);

        ctx.font = "300 12px Whitney";
        ctx.fillStyle = '#5c5e66';
        ctx.fillText("Today at " + makeRandomTime(), 175, 27);

        for (var i = 0; i < aFixedContent.length; i++) {
            ctx.font = "400 14px Whitney";
            ctx.fillStyle = '#dcddde';
            ctx.fillText(aFixedContent[i].trim(), 70, 50 + (21 * i));
        }

        ctx.beginPath();
        ctx.arc(30, 30, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage("https://cdn.discordapp.com/avatars/193800300518309888/4fcca7d6ba44f2de226003711e45ef69.jpg?size=40");
        ctx.drawImage(avatar, 10, 10, 40, 40);//ctx.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');

        msg.channel.send("", attachment);
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }

}


exports.Init = async function (client, msg) {
    try {
        var msgChannel = client.channels.get(msg.channel.id);
        var iID = Globals.g_GrooveID;

        let oResult = await Globals.Database.QueryRandom("Quotes", {});

        var cQuoteLink = oResult && oResult.length > 0 && oResult[0].cLink ? oResult[0].cLink : "";

        if (cQuoteLink) {
            msgChannel.send(
                {
                    files: [
                        cQuoteLink
                    ]
                });
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}

exports.Upload = function (client, msg) {
    try {
        var iAuthorID = msg.author.id;
        if (iAuthorID != Globals.g_GrooveID)
            return;

        var cMsgContent = msg.content;
        var aArgs = cMsgContent.split(" ");
        var cLink = aArgs[aArgs.length - 1];
        ConfirmAll(client, msg, cLink);
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }

}


async function ConfirmAll(client, msg, cLinkQuickSearch) {
    try {
        cLinkQuickSearch = cLinkQuickSearch.trim();
        await msg.channel.send(

            {
                embed:

                {
                    color: 3447003,
                    title: "So THIS is the screenshot? (Y/N)\r\n",
                    file: cLinkQuickSearch,
                    description: "(type 'EXIT' to end)",
                }
            })

        var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,

            {

                time: 120000

            });
        collector.on('collect', newmsg => {
            try {
                if (newmsg.content.toUpperCase() == "N") {
                    collector.stop();
                    newmsg.channel.send("Ok, terminating upload process then... :sob:");
                }
                else if (newmsg.content == "Y") {
                    collector.stop();
                    cLink = cLinkQuickSearch;
                    AddToDB(client, msg);
                }
            }
            catch (err) {
                ErrorHandler.HandleError(client, err);
            }
        });

    }
    catch (err) {
        msg.channel.send("Uh oh, I goofed (is that actually an image file?)");
        ErrorHandler.HandleError(client, err);
    }
}

function AddToDB(client, msg) {

    var oInsertObj = {};
    oInsertObj.cLink = cLink
    oInsertObj.DateUploaded = new Date();
    Globals.Database.Insert("Quotes", oInsertObj);
    msg.channel.send("**FILE UPLOADED!!!**");
}

function makeRandomTime() {
    var cHour = parseInt(12 * Math.random()) + 1;
    var cMinute = parseInt(60 * Math.random());
    cMinute = cMinute < 10 ? "0" + cMinute : cMinute;
    return cHour + ":" + cMinute + (Math.random() > 0.5 ? " A" : " P") + "M";
}