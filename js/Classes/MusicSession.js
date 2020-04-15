const Globals = require('../Globals.js')
const MusicTrack = require('../Classes/MusicTrack.js');
class MusicSession {
    constructor(obj) {
        if(Array.isArray(obj))
            var obj = obj[0];
        var encapsulatedObj = Object.assign( ...(Object.keys(obj).map(k => "_"+k)).map( (v, i) => ( {[v]: Object.values(obj)[i]} ) ) )
        obj && Object.assign(this, encapsulatedObj);
    }

    get voiceChannelID() {
        return this._voiceChannelID;
    }

    get textChannelID() {
        return this._textChannelID;
    }

    get production() {
        return this._production;
    }
    get tracks()
    {   
        let aTracks = [];
        if(this._tracks)
            this._tracks.forEach((t) => aTracks.push(new MusicTrack(t)));
        return aTracks;
    }

    get cUserId() {
        return this._cUserId;
    }
    hasTracks()
    {
        return this._tracks && this._tracks.length > 0
    }

    getCurrentTrack(iTrackID)
    {
        let oTrack = this._tracks && this._tracks.length > 0 ? this._tracks.find(t => t.bPlayed == false && t.trackID != (iTrackID)) : null;
        return oTrack ? new MusicTrack(oTrack) : null;
    }

    getPreviousTracks()
    {
        let aTracks = this._tracks && this._tracks.length > 0 ? this._tracks.filter(t => t.bPlayed == true) : null;
        if(!aTracks)
            return [];
        let aMusicTracks = [];
        aTracks.forEach((t) => aMusicTracks.push(new MusicTrack(t)));
        return aMusicTracks ? aMusicTracks : [];
    }
    getUpcomingTracks()
    {
        let aTracks = this._tracks && this._tracks.length > 0 ? this._tracks.filter(t => t.bPlayed == false) : null;
        if(!aTracks)
            return [];
        aTracks.shift();
        let aMusicTracks = [];
        aTracks.forEach((t) => aMusicTracks.push(new MusicTrack(t)));
        return aMusicTracks ? aMusicTracks : [];
    }
}
module.exports = MusicSession