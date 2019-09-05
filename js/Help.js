const Globals = require('./Globals.js')
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

const oHelpText = new EmbeddedHelpText(
   "Help",
   "Gets a list of  help text for command(s) that can be used for Groovebot",
    "",
    "``<command-name>``: If this argument is passed, then a more detailed help text will be presented for that command. Type in 'mod' to get mod-only commands",
    "``g!help quote`` (get the help text for the ``quote`` command)"
)
exports.oHelpText = oHelpText

exports.Init = function (client, msg) {

  var msgText = msg.content;
  var aMsgWords = msgText.split(" ");
  var cCommand = aMsgWords[1]
  let oCommandObj = cCommand ? Globals.oCommandMap.find(c => c.cCommand.toLowerCase() == cCommand.toLowerCase()) : null;

  if(cCommand)
  {
    if(oCommandObj && oCommandObj.oLongHelpText)
    {
      msg.channel.send(
        {
          embed: oCommandObj.oLongHelpText.oEmbedText
        });
    }
    else if(cCommand == "mod")
    {
      msg.channel.send(
        {
          embed:
          {
            color: 3447003,
            title: "**__MOD Commands List__**",
            description: "List of Groovebot commands for mods",
            fields: [
              {
                name: "g!vote",
                value: "Starts a wizard to begin an anonymous vote "
              },
              {
                name: "g!options",
                value: "Setup options for this server (must have 'Manage Server' permissions)"
              },
              {
                name: "g!rank-add-category <catname>",
                value: "Adds a rank category for the server"
              },
              {
                name: "g!rank-remove-category <catname>",
                value: "Removes a rank category"
              },
              {
                name: "g!rank-rename-category <oldname> <newname>",
                value: "Renames a rank category "
              },
              {
                name: "g!rank-add-role <catname> <rolename>",
                value: "Adds a role to a rank-category"
              },
              {
                name: "g!rank-remove-role <catname> <rolename>",
                value: "Removes a role from a rank-category "
              },
              {
                name: "g!library-add-category <catname>",
                value: "Adds a library-category to the server "
              },
              {
                name: "g!library-remove-category <catname>",
                value: "Removes a library category"
              },
              {
                name: "g!library-rename-category <oldname> <newname>",
                value: "Renames a library-category"
              },
              {
                name: "g!library-add-file",
                value: "Begins a wizard to add a file to a category"
              },
              {
                name: "g!library-remove-file",
                value: "Begins a wizard to remove a file to a category"
              },   
            ]
          }
        });
    }
    else
    {
      msg.channel.send(`Sorry I don't have any info for the command '${cCommand}'`);
    }
  }
  else
  {
    msg.channel.send(
      {
        embed:
        {
          color: 3447003,
          title: "**__Commands List__**",
          description: "List of Groovebot commands",
          fields: [
            {
              name: "g!help",
              value: "You just pressed this :laughing: "
            },
            {
              name: "g!rank <rolename>",
              value: " Add or remove a role"
            },
            {
              name: "g!get-library-file",
              value: " Start a wizard to get a library file"
            },
            {
              name: "g!idiom",
              value: " Let Groovebot try and come up with a wise saying! "
            },
            {
              name: "g!keysmash",
              value: " Make Groovebot smash their keyboard! "
            },
            {
              name: "g!quote",
              value: " Get a random Groove quote "
            },
            {
              name: "g!makequote <message>",
              value: " Make your own Groove quote "
            },
            {
              name: "g!compliment <users>",
              value: " Send a compliment to yourself or to anyone by mentioning them "
            },
            {
              name: "g!getcode",
              value: " Get the Github Repo for Groovebot "
            },
            {
              name: "g!nickname <name>",
              value: " Change Groove's nickname with a new nickname of your choosing! "
            },
            {
              name: "g!define <word> </t>",
              value: "Let Groovebot try to define a word for you! (Type '/t' at the end to get the actual definition)"
            },
            {
              name: "g!rank-print-category <catname?>",
              value: "Prints all roles in a category, or just print out all categories"
            },
            {
              name: "g!rank-print-all",
              value: "List out all roles and all categories"
            },
            {
              name: "g!rank <rankname>",
              value: "Assigns a rank to yourself"
            },
            {
              name: "\"AskOuija:\"",
              value: " Starts a ouija question (must set up in Options). Inputs are only one letter messages. Type \"goodbye\" to end. "
            },
            {
              name: "\"Hey Groovebot, \"",
              value: " Starts a question for Groovebot (must set up in Options). Inputs are only one word messages (no spaces). Type \"goodbye\" to end. "
            },
          ]
        }
      });
  }

}


