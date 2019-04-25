const Globals = require('./Globals.js')
exports.Init = function(client)
{
  client.on('message', msg => 
  {
    var ventriloquistInputChannelID = Globals.g_VentriloquistInputChannelID;
    var ventriloquistOutputChannelID = Globals.g_VentriloquistOutputChannelID;
    if (msg.author.id != client.user.id && msg.channel.id == ventriloquistInputChannelID) 
    {
      
         var outputChannel = client.channels.get(ventriloquistOutputChannelID);           
        outputChannel.send(msg.content);

    }
  });

}

exports.Change = function(client, msg)
{
  if(msg.author.id != Globals.g_GrooveID)
    msg.channel.send("LOL nope, this only for Groove");
  else
  {
    var gData = msg.content.split(" ")

    iChannelID = gData[1];
    if(iChannelID)
    {
      Globals.g_VentriloquistOutputChannelID = iChannelID;
      msg.channel.send("Changed output channel to: " 
      + Globals.g_VentriloquistOutputChannelID);
    }
   
  }

}



