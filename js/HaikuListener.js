const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const syllable = require('syllable');
const Discord = require('discord.js');

exports.ProcessMessage = function(client, msg) {
    try
    {
        if(syllable(msg.content) == 17)
            writeHaiku(msg);           
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }

}

function writeHaiku(oMessage)
{
    let aHaikuLines = parseHaiku(oMessage.content);
    if(aHaikuLines.length === 3)
    {
        let embed = createHaikuEmbed(oMessage, aHaikuLines);
        oMessage.channel.send("", embed)
    }
}

function parseHaiku(cContent)
{
    aWords = cContent.split(/[\s-+]/);
    let aLineBuild = [];
    let aSyllableGoals = [5,7,5];
    let aHaikuLines = [];
    for(let word of aWords)
    {
        aLineBuild.push(word);
        if(syllable(aLineBuild.join(" ")) == aSyllableGoals[0])
        {
            aHaikuLines.push(aLineBuild.join(" "));
            aSyllableGoals.shift();
            aLineBuild = [];
        }
    }
    if(aHaikuLines.length < 3 && aLineBuild.length > 0)
        aHaikuLines.push(aLineBuild.join(" "));
    

    if(syllable(aHaikuLines[0]) === 5 &&
        syllable(aHaikuLines[1]) === 7 &&
        syllable(aHaikuLines[2]) === 5 )
    {
        return aHaikuLines
    }
    else
        return [];
}

function createHaikuEmbed(oMessage, aHaikuLines)
{
    const attachment = new Discord.MessageAttachment("./images/Haiku.png", 'Haiku.png');
    var embed = new Discord.MessageEmbed()
        .setColor("#99AFD7")
        .setTitle(`A Haiku (by ${oMessage.author.username})`)
        .setDescription(aHaikuLines.join("\r\n"))
        .setAuthor(oMessage.author.tag, oMessage.author.displayAvatarURL({size:1024, format: "png"}))
        .attachFiles(attachment)
        .setThumbnail('attachment://Haiku.png')
    return embed;
}
