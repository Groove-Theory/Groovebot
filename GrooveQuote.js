const Globals = require('./Globals.js')
const Discord = require('discord.js');

var cLink = null;

exports.Init = function(client, msg)

{
  var msgChannel = client.channels.get(msg.channel.id);
  var iID = Globals.g_GrooveID;

  Globals.Database.QueryRandom("Quotes",
  {}).then(function(oResult)
  {
    var cQuoteLink = oResult && oResult.length > 0 && oResult[0].cLink ? oResult[0].cLink : "";

    if (cQuoteLink)
    {
      msgChannel.send(
      {
        files: [
          cQuoteLink
        ]
      });
    }

  });

}

exports.Upload = function(client, msg)

{
  var iAuthorID = msg.author.id;
  if (iAuthorID != Globals.g_GrooveID)
    return;

  var cMsgContent = msg.content;
  var aArgs = cMsgContent.split(" ");
  var cLink = aArgs[aArgs.length - 1];
  ConfirmAll(client, msg, cLink);

}


function ConfirmAll(client, msg, cLinkQuickSearch)
{
  cLinkQuickSearch = cLinkQuickSearch.trim();
  msg.channel.send(

    {
      embed:

      {
        color: 3447003,
        title: "So THIS is the screenshot? (Y/N)\r\n",
        file: cLinkQuickSearch,
        description: "(type 'EXIT' to end)",
      }
    }).then(function()

    {
      var collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id,

        {

          time: 120000

        });
      collector.on('collect', newmsg =>

        {
          if (newmsg.content.toUpperCase() == "N")

          {
            collector.stop();
            newmsg.channel.send("Ok, terminating upload process then... :sob:");
          }
          else if (newmsg.content == "Y")

          {
            collector.stop();
            cLink = cLinkQuickSearch;
            AddToDB(client, msg);
          }

        });
    }).catch(function(err)

    {
      msg.channel.send("Uh oh, I goofed (is that actually an image file?)" + err);
    });;
}

function AddToDB(client, msg)

{
  var oInsertObj = {};
  oInsertObj.cLink = cLink
  oInsertObj.DateUploaded = new Date();

  Globals.Database.Insert("Quotes", oInsertObj);

  msg.channel.send("**FILE UPLOADED!!!**");
}
