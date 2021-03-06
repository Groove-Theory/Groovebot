const Globals = require('../Globals.js')

class MusicTrack {
    constructor(obj) {
        var encapsulatedObj = Object.assign( ...(Object.keys(obj).map(k => "_"+k)).map( (v, i) => ( {[v]: Object.values(obj)[i]} ) ) )
        obj && Object.assign(this, encapsulatedObj);
    }

    get trackID() {
        return this._trackID;
    }
    get cURL() {
        return this._cURL;
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
        return this._cDurationString ? this._cDurationString : Globals.MillisecondsToTimeSymbol(this._iSeconds * 1000);
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