const Globals = require('../Globals.js')

class GrooveTweet {
    constructor(obj) {
        this._tweetid = obj.id_str || obj._tweetid;
        this._text = obj.text || obj._text;
        this._created_at = obj.created_at || obj._created_at;
    }

    get tweetID() {
        return this._tweetid;
    }
    get text() {
        return this._text;
    }
    get created_at() {
        return new Date(this._created_at);
    }
    get cURL() {
        return "https://twitter.com/Groob111111/status/" + this._tweetid;
    }
}
  module.exports = GrooveTweet