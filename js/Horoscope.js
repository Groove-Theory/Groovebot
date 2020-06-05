
const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const aztroJs = require("aztro-js");
const Discord = require('discord.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Horoscope",
  "Get your horoscope!",
   "``<sign>`` The zodiac sign you want a horoscope for ",
   "``<timeframe>`` get your horoscope for a specific timeframe (today, yesterday)",
   "``g!horoscope Leo yesterday`` (Returns yesterday's horoscope for Leo"
)

let aSigns = [
    {Name:'Aries', Color: "#4D0000", Image: "./images/Aries.png"},
    {Name:'Taurus', Color: "#668066", Image: "./images/Taurus.png"},
    {Name:'Gemini', Color: "#3D9999", Image: "./images/Gemini.png"},
    {Name:'Cancer', Color: "#5A2435", Image: "./images/Cancer.png"},
    {Name:'Leo', Color: "#D65930", Image: "./images/Leo.png"},
    {Name:'Virgo', Color: "#8A8A5C", Image: "./images/Virgo.png"},
    {Name:'Libra', Color: "#805280", Image: "./images/Libra.png"},
    {Name:'Scorpio', Color: "#001D2B", Image: "./images/Scorpio.png"},
    {Name:'Sagittarius', Color: "#993D00", Image: "./images/Sagittarius.png"},
    {Name:'Capricorn', Color: "#426262", Image: "./images/Capricorn.png"},
    {Name:'Aquarius', Color: "#8FB26B", Image: "./images/Aquarius.png"},
    {Name:'Pisces', Color: "#47008F", Image: "./images/Pisces.png"}];

let aTimeframes = ['Today', 'Yesterday', 'Tomorrow'];


exports.Init = async function (client, msg) {
    let aData = msg.content.split(/\s+/);
    aData.shift();

    let oSignData = aSigns.find(e => aData.find(e2 => e.Name.toLowerCase() == e2.toLowerCase()))
    let cTimeFrame = aTimeframes.find(e => aData.find(e2 => e.toLowerCase() == e2.toLowerCase()))
    
    if(!oSignData)
    {
        msg.channel.send("Fam I need a sign. Fuck")
        return;
    }
    cTimeFrame = cTimeFrame ? cTimeFrame : aTimeframes[0];
    getHoroscopeData(oSignData, cTimeFrame, msg)
}

function HoroscopeCallback(oData, oSignData, msg)
{
    const attachment = new Discord.MessageAttachment(oSignData.Image, 'zodiac.png');
    var embed = new Discord.MessageEmbed()
        .setColor(oSignData.Color)
        .setTitle(`Horoscope for ${oSignData.Name} (${oData["current_date"]})`)
        .setDescription(oData["description"])
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL({size:1024, format: "png"}))
        .attachFiles(attachment)
        .setThumbnail('attachment://zodiac.png')
        .addField("Date Range", oData["date_range"], false)
        .addField("Lucky Number", oData["lucky_number"], false)
        .addField("Lucky Time", oData["lucky_time"], false)
        .addField("Compatibility", oData["compatibility"], false)
        .addField("Mood", oData["mood"], false)
    
    msg.channel.send("", embed)
}

async function getHoroscopeData(oSignData, cTimeFrame, msg)
{
    let cSign = oSignData.Name;
    if(cTimeFrame == aTimeframes[0])
    {
        aztroJs.getTodaysHoroscope(cSign, function(res) {
            if(!res || !res["mood"])
                msg.channel.send("Sorry I can't find shit")
            else
                return HoroscopeCallback(res, oSignData, msg);
        })
    }
    else if(cTimeFrame == aTimeframes[1])
    {
        aztroJs.getYesterdaysHoroscope(cSign, function(res) {
            if(!res || !res["mood"])
                msg.channel.send("Sorry I can't find shit")
            else
                return HoroscopeCallback(res, oSignData, msg);
        })
    }
    else if(cTimeFrame == aTimeframes[2])
    {
        aztroJs.getTomorrowsHoroscope(cSign, function(res) {
            if(!res || !res["mood"])
                msg.channel.send("Sorry I can't find shit")
            else
                return HoroscopeCallback(res, oSignData, msg);
        })
    }
    else
        msg.channel.send("Sorry I can't find shit")
}