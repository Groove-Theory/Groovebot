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