const Globals = require('../Globals.js')
class Command {
  constructor(cCommand, fFunc, cHelpTextTitle, cShortHelpText, oLongHelpText, bModOnly, cCommandType) {
    this._cCommand = cCommand;
    this._fFunc = fFunc;
    this._cHelpTextTitle = cHelpTextTitle;
    this._cShortHelpText = cShortHelpText;
    this._oLongHelpText = oLongHelpText;
    this._bModOnly = bModOnly;
    this._cCommandType = cCommandType;
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

    get cCommandType() {
        return this._cCommandType;
    }
    set cCommandType(x) {
        this._cCommandType = x;
    }

}

module.exports = Command