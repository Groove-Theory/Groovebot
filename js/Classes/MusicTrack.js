const Globals = require('../Globals.js')

class MusicTrack {
    constructor(obj) {
        var encapsulatedObj = Object.assign( ...(Object.keys(obj).map(k => "_"+k)).map( (v, i) => ( {[v]: Object.values(obj)[i]} ) ) )
        obj && Object.assign(this, encapsulatedObj);
    }

    get voiceChannelID() {
        return this._voiceChannelID;
    }
    // set voiceChannelID(x) {
    //     this._cEmoji = x;
    // }

    get production() {
        return this._production;
    }

    get cURL() {
        return this._cURL;
    }

    get iPosition() {
        return this._iPosition;
    }

    get bPlayed() {
        return this._bPlayed;
    }

    get cDescription() {
        return this._cDescription;
    }

    get iSeconds() {
        return this._iSeconds;
    }

    get cDurationString() {
        return this._cDurationString ? this.cDurationString : Globals.MillisecondsToTimeSymbol(this._iSeconds * 1000);
    }

    get cUserName() {
        return this._cUserName;
    }

    get cUserId() {
        return this._cUserId;
    }

    // getFullName() {
    //   return `${this.lastName} ${this.firstName}`;
    // }
}
  module.exports = MusicTrack