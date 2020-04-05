const Globals = require('../Globals.js')
const Discord = require('discord.js');

class PaginationMessage {
  constructor() {
    this._aButtons = [];
    this._oMessage = null;
    this._oReactCollector = null;
  }
    get aButtons() {
        return this._aButtons;
    }

    get oMessage() {
        return this._oMessage;
    }
    set oMessage(x) {
        this._oMessage = x;
    }

    get oReactCollector() {
        return this._oReactCollector;
    }
    set oReactCollector(x) {
        this._oReactCollector = x;
    }

    addButton(oBtn)
    {
        this._aButtons.push(oBtn)
    }

    async Init()
    {
        this._aButtons.sort(function(a,b){a.iPosition > b.iPosition})
        let oMessage = this._oMessage;
        for(let i = 0; i < this._aButtons.length; i++)
        {
            await oMessage.react(this._aButtons[i].cEmoji)
        }
        let aButtons = this._aButtons;
        const reactionFilter = reaction => {
            return aButtons.find(b => b.cEmoji == reaction.emoji.name)
          }
        this._oReactCollector = new Discord.ReactionCollector(this._oMessage, reactionFilter, {max:100, time:120000});
        this._oReactCollector.on("collect", reaction => {
            if(reaction.users.cache.find(u=>u.id != Globals.g_Client.user.id))
            {
                let oButton = aButtons.find(b => b.cEmoji == reaction.emoji.name)
                if(oButton)
                {
                    oButton.fFunction();
                }
                reaction.users.cache.forEach(u => {if(u.id != Globals.g_Client.user.id) reaction.users.remove(u)});
            }

        })
        this._oReactCollector.on("end", collected  => {
            oMessage.reactions.removeAll(); 
        })
    }
}

module.exports = PaginationMessage
