const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const Syllable1 = require('syllable');
const Syllable2 = require('syllables');
const Discord = require('discord.js');

const randomPercentageThreshold = 0.05 //Turn this into an option?!??
exports.ProcessMessage = function(client, msg) {
    try
    {
        if(msg.content.search(/[0-9]/g) > -1)
            return; // don't do anything with strings with numbers
        
        if( (randomPercentageThreshold > Math.random()) &&  syllableCount(msg.content) == 17)
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
        if(syllableCount(aLineBuild.join(" ")) == aSyllableGoals[0])
        {
            aHaikuLines.push(aLineBuild.join(" "));
            aSyllableGoals.shift();
            aLineBuild = [];
        }
    }
    if(aHaikuLines.length < 3 && aLineBuild.length > 0)
        aHaikuLines.push(aLineBuild.join(" "));
    

    if(syllableCount(aHaikuLines[0]) === 5 &&
        syllableCount(aHaikuLines[1]) === 7 &&
        syllableCount(aHaikuLines[2]) === 5 )
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

function syllableCount(cContent)
{
    let sy1 = Syllable1(cContent);
    let sy2 = Syllable2(cContent);
    if(sy1 === sy2)
        return sy1
    return false;
}