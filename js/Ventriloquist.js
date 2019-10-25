const Globals = require('./Globals.js')
exports.ProcessMessage = function(client, msg) {
    var ventriloquistInputChannelID = Globals.g_VentriloquistInputChannelID;
    var ventriloquistOutputChannelID = Globals.g_VentriloquistOutputChannelID;
    if (msg.author.id == Globals.g_GrooveID && msg.channel.id == ventriloquistInputChannelID) {

        var outputChannel = client.channels.get(ventriloquistOutputChannelID);
        if(msg.attachments.size > 0)
        {
            outputChannel.send(msg.content, {
                files: Array.from(msg.attachments.values()).map(a => a.url)
              })
        }
        else
            outputChannel.send(msg.content);

    }
}

exports.Change = function(client, msg) {
    if (msg.author.id != Globals.g_GrooveID)
        msg.channel.send("LOL nope, this only for Groove");
    else {
        var gData = msg.content.split(" ")
        var iChannelID = gData[1];
        if (iChannelID) {
            Globals.g_VentriloquistOutputChannelID = iChannelID;
            msg.channel.send("Changed output channel to: " +
                Globals.g_VentriloquistOutputChannelID);
        }
    }
}
