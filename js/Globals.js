const Vote = require('./Vote.js')
const GrooveQuote = require('./GrooveQuote.js')
const Help = require('./Help.js')
const Ventriloquist = require('./Ventriloquist.js')
const Dictionary = require('./Dictionary.js')
const Compliment = require('./Compliment.js')
const Nickname = require('./Nickname.js')
const Idiom = require('./Idiom.js')
const KeySmash = require('./KeySmash.js')
const Options = require('./Options.js')
const Ranks = require('./Ranks.js')
const LibraryCategory = require('./Library/LibraryCategory.js')
const LibraryAddWizard = require('./Library/LibraryAddWizard.js')
const LibraryFileRemoveWizardSetup = require('./Library/LibraryFileRemoveWizardSetup.js')
const LibraryPrint = require('./Library/LibraryPrint.js')
const LibraryGetFileWizard = require('./Library/LibraryGetFileWizard.js')
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");


const EnvironmentMode = process.env.ENVIRONMENT_MODE;
const Environment = {
  TESTING: EnvironmentMode == 0 || EnvironmentMode == "0",
  STAGE: EnvironmentMode == 1 || EnvironmentMode == "1",
  PRODUCTION: EnvironmentMode == 2 || EnvironmentMode == "2",
};
exports.g_WindowsMachine = process.platform == "win32";

exports.cCommandPrefix = "g!"
if(Environment.PRODUCTION)
  exports.cCommandPrefix = "g!"
else if(Environment.TESTING)
  exports.cCommandPrefix = "gt!"
else if(Environment.STAGE)
  exports.cCommandPrefix = "gs!"
exports.Environment = Environment;

const oHelpText = new EmbeddedHelpText(
  "Help",
  "Gets a list of  help text for command(s) that can be used for Groovebot",
   "",
   "``<command-name>``: If this argument is passed, then a more detailed help text will be presented for that command",
   "``g!help quote`` (get the help text for the ``quote`` command)"
)

///////////////////TEST VARS///////////////testing new ide/////////////////////////

exports.g_mainChannelIDs = ["595643528760262686", "570056315989262346"];
exports.g_copyChannelIDs = ["595643579867856917", "570056992002015243"];

exports.g_GuildID = "470626956946309144";
exports.g_SparticistRole = "559075046245793823"
exports.g_CodeMasterRoleID = "563795804465135644"
exports.g_CouncilpersonRoleID = "563871903203196943"

exports.g_OuijaChannelID = "558156350320803851"

exports.g_VentriloquistInputChannelID = "595634269599039539"
exports.g_VentriloquistOutputChannelID = "570056315989262346"

///////////////////PRODUCTION VARS////////////////////////////////////////
if (exports.Environment.PRODUCTION)
{
  // TODO: We really need to figure out some MongoDB stuff here
  exports.g_mainChannelIDs = ["526080760101470230", "570056315989262346"];
  exports.g_copyChannelIDs = ["558159040371228683", "570056992002015243"];

  exports.g_GuildID = "526080760101470228";
  exports.g_SparticistRole = "526109092792762368" //"526109092792762368"
  exports.g_CodeMasterRoleID = "563903645104603158"
  exports.g_CouncilpersonRoleID = "526081028683726888"

  exports.g_OuijaChannelID = "559786059572183060"

  exports.g_VentriloquistInputChannelID = "561403085419839505"
  exports.g_VentriloquistOutputChannelID = "526082151062568960"

}


/////// NOT PRODUCTION DEPENDENT ///////
exports.g_Client = null;

exports.aGrooveQuotes = null;
exports.aCompliments = null;

exports.g_GrooveID = "193800300518309888";

exports.Database = null;

const oSendSourceHelpText =  new EmbeddedHelpText(
  "GetCode",
  "Gets the Github source code for Groovebot",
   "",
   "",
   "``g!getcode``"
)
exports.oSendSourceHelpText = oSendSourceHelpText
exports.oCommandMap = [];

exports.InitCommandMap = function(){
  exports.oCommandMap=[{
    cCommand: "help",
    fFunc: Help.Init,
    oLongHelpText: Help.oHelpText
  },
  {
    cCommand: "vote",
    fFunc: Vote.VoteSetup,
    oLongHelpText: Vote.oHelpText
  },
  {
    cCommand: "getcode",
    fFunc: SendSource,
    oLongHelpText: oSendSourceHelpText
  },
  {
    cCommand: "idiom",
    fFunc: Idiom.Init,
    oLongHelpText: Idiom.oHelpText
  },
  {
    cCommand: "keysmash",
    fFunc: KeySmash.Init,
    oLongHelpText: KeySmash.oHelpText
  },
  {
    cCommand: "quoteupload",
    fFunc: GrooveQuote.Upload,
    oLongHelpText: GrooveQuote.cUploadHelpText
  },
  {
    cCommand: "quote",
    fFunc: GrooveQuote.Init,
    oLongHelpText: GrooveQuote.oQuoteHelpText
  },
  {
    cCommand: "ventriloquist",
    fFunc: Ventriloquist.Change,
    oLongHelpText: ""
  },
  {
    cCommand: "compliment",
    fFunc: Compliment.Init,
    oLongHelpText: Compliment.oHelpText
  },
  {
    cCommand: "nickname",
    fFunc: Nickname.Init,
    oLongHelpText: Nickname.oHelpText
  },
  {
    cCommand: "options",
    fFunc: Options.Init,
    oLongHelpText: Options.oHelpText
  },
  {
    cCommand: "makequote",
    fFunc: GrooveQuote.MakeQuote,
    oLongHelpText: GrooveQuote.oMakeQuoteHelpText
  },
  {
    cCommand: "define",
    fFunc: Dictionary.Init,
    oLongHelpText: Dictionary.oHelpText
  },
  {
    cCommand: "rank-add-category",
    fFunc: Ranks.AddCategory,
    oLongHelpText: Ranks.oAddCategoryHelpText
  },
  {
    cCommand: "rank-remove-category",
    fFunc: Ranks.RemoveCategory,
    oLongHelpText: Ranks.oRemoveCategoryHelpText
  },
  {
    cCommand: "rank-rename-category",
    fFunc: Ranks.RenameCategory,
    oLongHelpText: Ranks.oRenameCategoryHelpText
  },
  {
    cCommand: "rank-add-role",
    fFunc: Ranks.AddCategoryRank,
    oLongHelpText: Ranks.oAddRoleHelpText
  },
  {
    cCommand: "rank-remove-role",
    fFunc: Ranks.RemoveCategoryRank,
    oLongHelpText: Ranks.oRemoveRoleHelpText
  },
  {
    cCommand: "rank-print-category",
    fFunc: Ranks.ShowCategorysRanks,
    oLongHelpText: Ranks.oPrintRankCategoryHelpText
  },
  {
    cCommand: "rank-print-all",
    fFunc: Ranks.PrintRanks,
    oLongHelpText: Ranks.oPrintAllHelpText
  },
  {
    cCommand: "rank",
    fFunc: Ranks.ToggleUserRank,
    oLongHelpText: Ranks.oToggleRankHelpText
  },
  {
    cCommand: "library-add-category",
    fFunc: LibraryCategory.AddCategory,
    oLongHelpText: LibraryCategory.oAddCategoryHelpText
  },
  {
    cCommand: "library-remove-category",
    fFunc: LibraryCategory.RemoveCategory,
    oLongHelpText: LibraryCategory.oRemoveCategoryHelpText
  },
  {
    cCommand: "library-rename-category",
    fFunc: LibraryCategory.RenameCategory,
    oLongHelpText: LibraryCategory.oRenameCategoryHelpText
  },
  {
    cCommand: "library-add-file",
    fFunc: LibraryAddWizard.LibraryFileAddWizardSetup,
    oLongHelpText: LibraryAddWizard.oAddFileHelpText
  },
  {
    cCommand: "library-remove-file",
    fFunc: LibraryFileRemoveWizardSetup.LibraryFileRemoveWizardSetup,
    oLongHelpText: LibraryFileRemoveWizardSetup.oRemoveFileHelpText
  },
  {
    cCommand: "library-print",
    fFunc: LibraryPrint.PrintLibrary,
    oLongHelpText: LibraryPrint.oPrintHelpText
  },
  {
    cCommand: "library-get-file",
    fFunc: LibraryGetFileWizard.GetLibraryFileWizardSetup,
    oLongHelpText: LibraryGetFileWizard.oGetFileHelpText
  }]
}

exports.OptionTypes = {
    "guildid": {"optiontype": "channel"},
    "production": {"optiontype": "boolean"},
    "guildname": {"optiontype": "string"},
    "toggleouija": {"optiontype": "boolean"},
    "ouijachannel": {"optiontype": "channel"},
    "copyinputchannel": {"optiontype": "channel"},
    "copyoutputchannel": {"optiontype": "channel"},
    "togglechannelcopy": {"optiontype": "boolean"},
    "silencechannels": {"optiontype": "channelarray"},
}



function SendSource(client, msg)
{
  msg.send("https://github.com/Groove-Theory/Groovebot");
}


exports.SendSource = SendSource 