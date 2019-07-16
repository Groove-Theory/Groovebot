const Globals = require('./Globals.js')
const Discord = require('discord.js');
//const Canvas = require('canvas');
const { registerFont, createCanvas, loadImage } = require('canvas')

const wrap = (s, w) => s.replace(
    /(?![^\n]{1,40}$)([^\n]{1,40})\s/g, '$1\n'
);

var cLink = null;

function makeRandomTime() {
    var cHour = parseInt(12 * Math.random()) + 1;
    var cMinute = parseInt(60 * Math.random());
    cMinute = cMinute < 10 ? "0" + cMinute : cMinute;
    return cHour + ":" + cMinute + (Math.random() > 0.5 ? " A" : " P") + "M";
}


exports.MakeQuote = async function(client, msg) {

    if (msg.author.id == 299248686565687296)
        return;

    var member = msg.member;
    var cContent = msg.content.substring(12);
    var aContent = cContent.split("\\r\\n");
    var aFixedContent = [];
    aContent.forEach(function(part, index, theArray) {
        var cWrappedString = wrap(part)
        var aWrappedString = cWrappedString.split("\n");
        aWrappedString.forEach(function(part, index, theArray) {
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


exports.Init = function(client, msg) {
    var msgChannel = client.channels.get(msg.channel.id);
    var iID = Globals.g_GrooveID;

    Globals.Database.QueryRandom("Quotes",
        {}).then(function(oResult) {
            var cQuoteLink = oResult && oResult.length > 0 && oResult[0].cLink ? oResult[0].cLink : "";

            if (cQuoteLink) {
                msgChannel.send(
                    {
                        files: [
                            cQuoteLink
                        ]
                    });
            }

        });

}

exports.Upload = function(client, msg) {
    var iAuthorID = msg.author.id;
    if (iAuthorID != Globals.g_GrooveID)
        return;

    var cMsgContent = msg.content;
    var aArgs = cMsgContent.split(" ");
    var cLink = aArgs[aArgs.length - 1];
    ConfirmAll(client, msg, cLink);

}


function ConfirmAll(client, msg, cLinkQuickSearch) {
    cLinkQuickSearch = cLinkQuickSearch.trim();
    msg.channel.send(

        {
            embed:

            {
                color: 3447003,
                title: "So THIS is the screenshot? (Y/N)\r\n",
                file: cLinkQuickSearch,
                description: "(type 'EXIT' to end)",
            }
        }).then(function() {
            var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,

                {

                    time: 120000

                });
            collector.on('collect', newmsg => {
                if (newmsg.content.toUpperCase() == "N") {
                    collector.stop();
                    newmsg.channel.send("Ok, terminating upload process then... :sob:");
                }
                else if (newmsg.content == "Y") {
                    collector.stop();
                    cLink = cLinkQuickSearch;
                    AddToDB(client, msg);
                }

            });
        }).catch(function(err) {
            msg.channel.send("Uh oh, I goofed (is that actually an image file?)" + err);
        });;
}

function AddToDB(client, msg) {
    var oInsertObj = {};
    oInsertObj.cLink = cLink
    oInsertObj.DateUploaded = new Date();

    Globals.Database.Insert("Quotes", oInsertObj);

    msg.channel.send("**FILE UPLOADED!!!**");
}
