const Globals = require('../Globals.js')

class LinkedTalkChannel {
    constructor() {
    }

    get guildID() {
        return this._guildid;
    }
    get inputChannelID() {
        return this._inputchannelid;
    }
    get outputChannelID() {
        return this._outputchannelid;
    }
    get inputChannel() {
        return this._inputChannel;
    }
    get outputChannel() {
        return this._outputChannel;
    }

    Talk(oMessage) {
        let aMsgContents = oMessage.content.split(/\s+/);
        aMsgContents.shift();
        let cMessage = aMsgContents.join(" ");
        cMessage = cMessage ? cMessage : ":wave:"
        let cAttachmentURL = null;
        if(oMessage.attachments.size > 0)
        {
            cAttachmentURL = Array.from(oMessage.attachments)[0][1].url   
            this._outputChannel.send({
                "content":cMessage,
                "files": [cAttachmentURL]
            });
        }
        else
            this._outputChannel.send(cMessage);
    }

    async Query(guildid, inputchannelid, outputchannelid){
        let oQueryObject = {};
        if(guildid)
            oQueryObject.guildid = guildid;
        if(inputchannelid)
            oQueryObject.inputchannelid = inputchannelid;
        if(outputchannelid)
            oQueryObject.outputchannelid = outputchannelid;

        let aResult = await Globals.Database.Query("LinkedTalkChannels", oQueryObject);
        var oResult = aResult.length > 0 ? aResult[0] : null;
        if (!oResult) { return; }

        if(Array.isArray(oResult))
            var oResult = oResult[0];
        var encapsulatedObj = Object.assign( ...(Object.keys(oResult).map(k => "_"+k)).map( (v, i) => ( {[v]: Object.values(oResult)[i]} ) ) )
        oResult && Object.assign(this, encapsulatedObj);

        this._inputChannel = Globals.g_Client.channels.cache.get(this._inputchannelid);
        this._outputChannel = Globals.g_Client.channels.cache.get(this._outputchannelid);
    }
}
  module.exports = LinkedTalkChannel