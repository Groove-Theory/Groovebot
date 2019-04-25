exports.Init = function(client, msg)
{      
  msg.channel.send({embed: 
  {
    color: 3447003,
    title: "Commands List",
    description: "**g!help**: You just pressed this :laughing: \r\n"
    + "**g!vote**: Trigger anonymous voting (only Councilperson or Code Master can use this)\r\n"
    + "**g!quote**: Get a random quote \r\n"
    + "**g!quote <username?> <link?>**: Upload a quote of someone with an option to quickly put in their info or have groovebot help you out (mentions purposefully don't work with this... don't ping them) \r\n"
    + "**g!compliment <users>**: Send a compliment to yourself or to anyone by mentioning them (mentions only, so DO ping them!)\r\n"
    + "**g!getcode**: Get a Github Gist of the latest code uploaded for public access \r\n"
    + "**g!nickname <name>**: Change Groove's nickname with a new nickname of your choosing! \r\n"
    + "\r\n**\"AskOuija:\"**: Starts a ouija question (only in #ask-ouija). Inputs are only one letter messages. Type \"goodbye\" to end. \r\n"
    + "**\"Hey Groovebot, \"**: Starts a question for Groovebot (only in #ask-ouija). Inputs are only one word messages (no spaces). Type \"goodbye\" to end. \r\n"
  }});
}
