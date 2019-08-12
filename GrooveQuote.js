const Discord = require("discord.js");
const { registerFont, createCanvas, loadImage } = require("canvas");
const Globals = require("./Globals.js");
const ErrorHandler = require("./ErrorHandler.js");

const wrap = s => s.replace(/(?![^\n]{1,40}$)([^\n]{1,40})\s/g, "$1\n");

function makeRandomTime() {
  const cHour = parseInt(12 * Math.random()) + 1;
  let cMinute = parseInt(60 * Math.random());
  cMinute = cMinute < 10 ? `0${cMinute}` : cMinute;
  return `${cHour}:${cMinute}${Math.random() > 0.5 ? " A" : " P"}M`;
}

function AddToDB(client, msg, cLink) {
  const oInsertObj = {};
  oInsertObj.cLink = cLink;
  oInsertObj.DateUploaded = new Date();
  Globals.Database.Insert(client, "Quotes", oInsertObj);
  msg.channel.send("**FILE UPLOADED!!!**");
}

async function ConfirmAll(client, msg, cLinkQuickSearch) {
  try {
    const cLinkQuickSearchTrimmed = cLinkQuickSearch.trim();
    await msg.channel.send({
      embed: {
        color: 3447003,
        title: "So THIS is the screenshot? (Y/N)\r\n",
        file: cLinkQuickSearchTrimmed,
        description: "(type 'EXIT' to end)"
      }
    });

    const collector = new Discord.MessageCollector(
      msg.channel,
      m => m.author.id === msg.author.id,

      {
        time: 120000
      }
    );
    collector.on("collect", newmsg => {
      try {
        if (newmsg.content.toUpperCase() === "N") {
          collector.stop();
          newmsg.channel.send("Ok, terminating upload process then... :sob:");
        } else if (newmsg.content === "Y") {
          collector.stop();
          const cLink = cLinkQuickSearch;
          AddToDB(client, msg, cLink);
        }
      } catch (err) {
        ErrorHandler.HandleError(client, err);
      }
    });
  } catch (err) {
    msg.channel.send("Uh oh, I goofed (is that actually an image file?)");
    ErrorHandler.HandleError(client, err);
  }
}

exports.MakeQuote = async function MakeQuote(client, msg) {
  try {
    if (msg.author.id === 299248686565687296) return;

    const cContent = msg.content.substring(12);
    const aContent = cContent.split("\\r\\n");
    const aFixedContent = [];
    aContent.forEach(function ContentForEach(part) {
      const cWrappedString = wrap(part);
      const aWrappedString = cWrappedString.split("\n");
      aWrappedString.forEach(function WrappedStringForEach(str) {
        aFixedContent.push(str);
      });
    });

    registerFont("./FontFiles/Catamaran-Medium.ttf", { family: "Whitney" });

    const canvas = createCanvas(350, 40 + 21 * aFixedContent.length);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#36393f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.font = "normal normal 500 normal 70px / 70px 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 550";
    ctx.font = "bold 16px Whitney";
    ctx.fillStyle = "#ff00b1";
    ctx.fillText("Groove Theory", 70, 27);

    ctx.font = "300 12px Whitney";
    ctx.fillStyle = "#5c5e66";
    ctx.fillText(`Today at ${makeRandomTime()}`, 175, 27);

    for (let i = 0; i < aFixedContent.length; i += 1) {
      ctx.font = "400 14px Whitney";
      ctx.fillStyle = "#dcddde";
      ctx.fillText(aFixedContent[i].trim(), 70, 50 + 21 * i);
    }

    ctx.beginPath();
    ctx.arc(30, 30, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(
      "https://cdn.discordapp.com/avatars/193800300518309888/4fcca7d6ba44f2de226003711e45ef69.jpg?size=40"
    );
    ctx.drawImage(avatar, 10, 10, 40, 40); // ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.Attachment(
      canvas.toBuffer(),
      "welcome-image.png"
    );

    msg.channel.send("", attachment);
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};

exports.Init = async function Init(client, msg) {
  try {
    const msgChannel = client.channels.get(msg.channel.id);

    const oResult = await Globals.Database.QueryRandom(client, "Quotes", {});

    const cQuoteLink =
      oResult && oResult.length > 0 && oResult[0].cLink ? oResult[0].cLink : "";

    if (cQuoteLink) {
      msgChannel.send({
        files: [cQuoteLink]
      });
    }
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};

exports.Upload = function Upload(client, msg) {
  try {
    const iAuthorID = msg.author.id;
    if (iAuthorID !== Globals.g_GrooveID) return;

    const cMsgContent = msg.content;
    const aArgs = cMsgContent.split(" ");
    const cLink = aArgs[aArgs.length - 1];
    ConfirmAll(client, msg, cLink);
  } catch (err) {
    ErrorHandler.HandleError(client, err);
  }
};
