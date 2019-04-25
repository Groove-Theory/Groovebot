const Globals = require('./Globals.js')
const Discord = require('discord.js');
var iRuleMessageCount = 0;
var aRuleData = [];
var aActionVerbs = ["ADD", "EDIT", "DELETE", "REFRESH"];
var bLocked = false;
var cNewRuleText = "";

exports.RulesInit = function(client, msg) {
    console.log("Not functional yet");
}
exports.RulesInit2 = function(client, msg) {
    bLocked = true;
    getRuleMessages();
    msg.channel.send({
        embed: {
            color: 3447003,
            title: "What do you want to do? (press 'EXIT' to leave)",
            description: "'ADD': Add a new rule" + "\r\n" + "'EDIT': Edit a currently existing rule" + "\r\n" + "'DELETE': Delete a currently existing rule" + "\r\n" + "'REFRESH': Refresh rules channel to show current rules",
        }
    });
    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
        time: 120000
    });
    collector.on('collect', newmsg => {
        if(newmsg.content.toUpperCase() == "EXIT") {
            collector.stop();
            newmsg.channel.send("Ok, terminating upload process then... :sob:");
        }
        else if(newmsg.content.toUpperCase() == aActionVerbs[0]) {
            collector.stop();
            makeRule(client, newmsg);
        }
        else if(newmsg.content.toUpperCase() == aActionVerbs[1]) {
            collector.stop();
            getRule(client, newmsg, 1);
        }
        else if(newmsg.content.toUpperCase() == aActionVerbs[2]) {
            collector.stop();
            getRule(client, newmsg, 2);
        }
        else if(newmsg.content.toUpperCase() == aActionVerbs[3]) {
            collector.stop();
            confirmAction(client, newmsg, 3);
        }
    });
}

function getRule(client, msg, iMode) {
    var cVerb = aActionVerbs[iMode]
    msg.channel.send({
        embed: {
            color: 3447003,
            title: "Which rule do you want to  do you want to " + cVerb + "? (press 'EXIT' to leave)",
            description: "There are currently " + aRuleData.length + " rules. Please enter the rule number that you want to " + cVerb,
        }
    });
    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
        time: 120000
    });
    collector.on('collect', newmsg => {
        if(newmsg.content.toUpperCase() == "EXIT") {
            collector.stop();
            newmsg.channel.send("Ok, terminating upload process then... :sob:");
        }
        else {
            var cMessageText = newmsg.content;
            var iInput = parseInt(cMessageText)
            if(iInput > 0 && iInput <= aRuleData.length) {
                collector.stop();
                confirmAction(client, newmsg, iMode);
            }
            else {
                msg.channel.send("Please enter in a number from 1 to " + aRuleData.length);
            }
        }
    });
}

function makeRule(client, msg) {
    msg.channel.send({
        embed: {
            color: 3447003,
            title: "Enter the text for the new rule, including subsections (press 'EXIT' to leave)",
            description: "Please type it exactly how it is. This will be Rule #" + (aRuleData.length + 1)
        }
    });
    var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, {
        time: 120000
    });
    collector.on('collect', newmsg => {
        if(newmsg.content.toUpperCase() == "EXIT") {
            collector.stop();
            newmsg.channel.send("Ok, terminating upload process then... :sob:");
        }
        else {
            collector.stop();
            cNewRuleText = newmsg.content;
            var iInput = parseInt(cMessageText)
            confirmAction(client, newmsg, 0);
        }
    });
}

function confirmAction(client, msg, iMode) {}

function refresh(client, msg) {}

function getRuleMessages() {
    var file = require("./JSONFILES/rules.json");
    aRuleData = file.RulesData;
}
