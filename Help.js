exports.Init = function Init(client, msg) {
  msg.channel.send({
    embed: {
      color: 3447003,
      title: "**__Commands List__**",
      description: "List of Groovebot commands",
      fields: [
        {
          name: "g!help",
          value: "You just pressed this :laughing: "
        },
        {
          name: "g!options",
          value:
            "Setup options for this server (must have 'Manage Server' permissions)"
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
          value:
            " Send a compliment to yourself or to anyone by mentioning them "
        },
        {
          name: "g!getcode",
          value: " Get the Github Repo for Groovebot "
        },
        {
          name: "g!nickname <name>",
          value:
            " Change Groove's nickname with a new nickname of your choosing! "
        },
        {
          name: '"AskOuija:"',
          value:
            ' Starts a ouija question (must set up in Options). Inputs are only one letter messages. Type "goodbye" to end. '
        },
        {
          name: '"Hey Groovebot, "',
          value:
            ' Starts a question for Groovebot (must set up in Options). Inputs are only one word messages (no spaces). Type "goodbye" to end. '
        }
      ]
    }
  });
};
