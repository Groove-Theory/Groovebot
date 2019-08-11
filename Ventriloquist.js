const Globals = require("./Globals.js");

exports.ProcessMessage = function ProcessMessage(client, msg) {
  const ventriloquistInputChannelID = Globals.g_VentriloquistInputChannelID;
  const ventriloquistOutputChannelID = Globals.g_VentriloquistOutputChannelID;
  if (
    msg.author.id === Globals.g_GrooveID &&
    msg.channel.id === ventriloquistInputChannelID
  ) {
    const outputChannel = client.channels.get(ventriloquistOutputChannelID);
    outputChannel.send(msg.content);
  }
};

exports.Change = function Change(client, msg) {
  if (msg.author.id !== Globals.g_GrooveID) {
    msg.channel.send("LOL nope, this only for Groove");
  } else {
    const gData = msg.content.split(" ");
    const iChannelID = gData[1];
    if (iChannelID) {
      Globals.g_VentriloquistOutputChannelID = iChannelID;
      msg.channel.send(
        `Changed output channel to: ${Globals.g_VentriloquistOutputChannelID}`
      );
    }
  }
};
