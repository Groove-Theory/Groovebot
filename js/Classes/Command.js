const Globals = require('../Globals.js')
class Command {
  constructor(_cCommand, _fFunc, _cShortHelpText, _oLongHelpText, bModOnly, cCommandType) {
    this._cCommand = _cCommand;
    this._fFunc = _fFunc;
    this._cHelpTextTitle = _cHelpTextTitle;
    this._cShortHelpText = _cShortHelpText;
    this._oLongHelpText = _oLongHelpText;
    this._bModOnly = bModOnly;
    this._bModOnly = bModOnly;
  }
    get cCommand() {
        return this._cCommand;
    }
    set cCommand(x) {
        this._cCommand = x;
    }

    get fFunc() {
        return this._fFunc;
    }
    set fFunc(x) {
        this._fFunc = x;
    }

    get cHelpTextTitle() {
        return this._cHelpTextTitle;
    }
    set cHelpTextTitle(x) {
        this._cHelpTextTitle = x;
    }

    get cShortHelpText() {
        return this._cShortHelpText;
    }
    set cShortHelpText(x) {
        this._cShortHelpText = x;
    }

    get oLongHelpText() {
        return this._oLongHelpText;
    }
    set oLongHelpText(x) {
        this._oLongHelpText = x;
    }

    get bModOnly() {
        return this._bModOnly;
    }
    set bModOnly(x) {
        this._bModOnly = x;
    }

}

module.exports = Command