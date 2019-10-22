class GroovePointMember {
  constructor(iGuildID, iUserID) {
    this._iGuildID = iGuildID;
    this._iUserID = iUserID;
  }
  get iGuildID() {
    return this._iGuildID;
  }
  get iUserID() {
    return this._iUserID;
  }

  get dLastMessage() {
    return this._dLastMessage;
  }
  set dLastMessage(x) {
    this._dLastMessage = x;
  }




}

class EmbeddedHelpText {
  constructor(cCommand, cDesc, cReqArgs, cOpArgs, cExample) {
    this.cCommand = cCommand;
    this.cDesc = cDesc;
    this.cReqArgs = cReqArgs;
    this.cOpArgs = cOpArgs;
    this.cExample = cExample;
    this.oEmbedText = {
      "color": 3447003,
      "title": `**__${this.cCommand}__**`,
      "description": "---------------------------------------",
      "fields": [
        {
          "name": "Description",
          "value": this.cDesc
        },
        {
          "name": "Required Args",
          "value": this.cReqArgs ? this.cReqArgs : "(None)"
        },
        {
          "name": "Optional Args",
          "value": this.cOpArgs ? this.cOpArgs : "(None)"
        },
        {
          "name": "Example",
          "value": this.cExample
        }
      ]
    };
  }
}

module.exports = EmbeddedHelpText