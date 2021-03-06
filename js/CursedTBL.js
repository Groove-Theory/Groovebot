const Globals = require('./Globals.js')
const Discord = require('discord.js');
const ErrorHandler = require('./ErrorHandler.js');
let registerFont, createCanvas, loadImage;
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
    "Cursed",
    "Makes any image cursed",
     "``<image>`` url or attached image with the command",
     "",
     "``g!cursed image.jpg`` (makes a cursed version of image.jpg)"
 )

if(process.platform != "win32")
{
    const Canvas = require('canvas');
    registerFont = Canvas.registerFont;
    createCanvas = Canvas.createCanvas;
    loadImage = Canvas.loadImage;
}

exports.MakeCursed = function (client, msg) {
    try {
        if(Globals.g_WindowsMachine)
        {
            msg.channel.send("Sorry, cant use this while testing on a Windows Machine")
            return true;
        }

        let cAttachmentURL = "";

        if(msg.attachments.size > 0)
        {
            cAttachmentURL = Array.from(msg.attachments)[0][1].url
            processImage(cAttachmentURL, msg.channel)
        }
        else{
            setTimeout(function(){
                    if(msg.embeds[0] && msg.embeds[0].url)
                    {
                        cAttachmentURL = msg.embeds[0].url;
                        processImage(cAttachmentURL, msg.channel);
                    }
            }, 1500);
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }

}

async function processImage(cAttachmentURL, oChannel)
{
    if(attachIsImage(cAttachmentURL))
    {
        const image = await loadImage(cAttachmentURL);

        const canvas = createCanvas(1000, 1000);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0000FF";
        ctx.fillRect(0, 475, 1000, 50);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

        oChannel.send("**C U R S E D**", attachment);
    }
}

function attachIsImage(cAttachmentURL)
{
    return cAttachmentURL.indexOf(".png") > -1 || cAttachmentURL.indexOf(".jpeg") > -1|| cAttachmentURL.indexOf(".jpg") > -1
}