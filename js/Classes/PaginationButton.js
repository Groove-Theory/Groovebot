const Globals = require('../Globals.js')
class PaginationButton {
  constructor(cEmoji, fFunction, iPosition) {
    this._cEmoji = cEmoji;
    this._fFunction = fFunction;
    this._iPosition = iPosition;
  }
    get cEmoji() {
        return this._cEmoji;
    }
    set cEmoji(x) {
        this._cEmoji = x;
    }

    get fFunction() {
        return this._fFunction;
    }
    set fFunction(x) {
        this._fFunction = x;
    }

    get iPosition() {
        return this._iPosition;
    }
    set iPosition(x) {
        this._iPosition = x;
    }

}

module.exports = PaginationButton