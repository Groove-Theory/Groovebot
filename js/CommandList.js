const Globals = require('./Globals.js')
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
const Streak = require('./Streak.js')
const Approve = require('./Approve.js')
const CursedTBL = require('./CursedTBL.js')
const GrooveSong = require('./GrooveSong.js')
const GroovePointsRepHandler = require("./GroovePoints/GroovePointsRepHandler.js");
const GroovePointsLeaderboardHandler = require("./GroovePoints/GroovePointsLeaderboardHandler.js");
const GroovePointsDailyHandler = require("./GroovePoints/GroovePointsDailyHandler.js");
const Command = require("./Classes/Command.js");

exports.InitCommandMap = function(){
    Globals.aCommandMap.push(new Command(
      "help",
      Help.Init,
      "g!help",
      "Press g!help <command name> to get detailed help of a specific command",
      Help.oHelpText,
      false,
      "INFORMATION"
    ));
    Globals.aCommandMap.push(new Command(
      "vote",
      Vote.VoteSetup,
      "g!vote",
      "Starts a wizard to begin an anonymous vote ",
      Vote.oHelpText,
      true,
      "MOD"
    ));
    Globals.aCommandMap.push(new Command(
      "getcode",
      Globals.SendSource,
      "g!getcode",
      " Get the Github Repo for Groovebot ",
      Globals.oSendSourceHelpText,
      false,
      "INFORMATION"
    ));
    Globals.aCommandMap.push(new Command(
      "idiom",
      Idiom.Init,
      "g!idiom",
      " Let Groovebot try and come up with a wise saying! ",
      Idiom.oHelpText,
      false,
      "FUN"
    ));
    Globals.aCommandMap.push(new Command(
      "keysmash",
      KeySmash.Init,
      "g!keysmash",
      " Make Groovebot smash their keyboard! ",
      KeySmash.oHelpText,
      false,
      "FUN"
    ));
    Globals.aCommandMap.push(new Command(
      "quoteupload",
      GrooveQuote.Upload,
      "",
      null,
      true,
      "HIDDEN"
    ));
    Globals.aCommandMap.push(new Command(
      "quote",
      GrooveQuote.Init,
      "g!quote",
      " Get a random Groove quote ",
      GrooveQuote.oQuoteHelpText,
      false,
      "GROOVE"
    ));
    Globals.aCommandMap.push(new Command(
      "v",
      Ventriloquist.Change,
      "",
      null,
      true,
      "HIDDEN"
    ));
    Globals.aCommandMap.push(new Command(
      "compliment",
      Compliment.Init,
      "g!compliment <users>",
      " Send a compliment to yourself or to anyone by mentioning them ",
      Compliment.oHelpText,
      false,
      "FUN"
    ));
    Globals.aCommandMap.push(new Command(
      "nickname",
      Nickname.Init,
      "g!nickname <name>",
      " Change Groove's nickname with a new nickname of your choosing! ",
      Nickname.oHelpText,
      false,
      "GROOVE"
    ));
    Globals.aCommandMap.push(new Command(
      "options",
      Options.Init,
      "g!options",
      "Setup options for this server (must have 'Manage Server' permissions)",
      Options.oHelpText,
      true,
      "MOD"
    ));
    Globals.aCommandMap.push(new Command(
      "makequote",
      GrooveQuote.MakeQuote,
      "g!makequote <message>",
      " Make your own Groove quote ",
      GrooveQuote.oMakeQuoteHelpText,
      false,
      "GROOVE"
    ));
    Globals.aCommandMap.push(new Command(
      "define",
      Dictionary.Init,
      "g!define <word> </t>",
      "Let Groovebot try to define a word for you! (Type '/t' at the end to get the actual definition)",
      Dictionary.oHelpText,
      false,
      "FUN"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-add-category",
      Ranks.AddCategory,
      "g!rank-add-category <catname>",
      "Adds a rank category for the server",
      Ranks.oAddCategoryHelpText,
      true,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-remove-category",
      Ranks.RemoveCategory,
      "g!rank-remove-category <catname>",
      "Removes a rank category",
      Ranks.oRemoveCategoryHelpText,
      true,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-rename-category",
      Ranks.RenameCategory,
      "g!rank-rename-category <oldname> <newname>",
      "Renames a rank category ",
      Ranks.oRenameCategoryHelpText,
      true,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-add-role",
      Ranks.AddCategoryRank,
      "g!rank-add-role <catname> <rolename>",
      "Adds a role to a rank-category",
      Ranks.oAddRoleHelpText,
      true,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-remove-role",
      Ranks.RemoveCategoryRank,
      "g!rank-remove-role <catname> <rolename>",
      "Removes a role from a rank-category ",
      Ranks.oRemoveRoleHelpText,
      true,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-print-category",
      Ranks.ShowCategorysRanks,
      "g!rank-print-category <catname?>",
      "Prints all roles in a category, or just print out all categories",
      Ranks.oPrintRankCategoryHelpText,
      false,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank-print-all",
      Ranks.PrintRanks,
      "g!rank-print-all",
      "List out all roles and all categories",
      Ranks.oPrintAllHelpText,
      false,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "rank",
      Ranks.ToggleUserRank,
      "g!rank <rolename>",
      " Add or remove a role",
      Ranks.oToggleRankHelpText,
      false,
      "RANK"
    ));
    Globals.aCommandMap.push(new Command(
      "library-add-category",
      LibraryCategory.AddCategory,
      "g!library-add-category <catname>",
      "Adds a library-category to the server ",
      LibraryCategory.oAddCategoryHelpText,
      true,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "library-remove-category",
      LibraryCategory.RemoveCategory,
      "g!library-remove-category <catname>",
      "Removes a library category",
      LibraryCategory.oRemoveCategoryHelpText,
      true,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "library-rename-category",
      LibraryCategory.RenameCategory,
      "g!library-rename-category <oldname> <newname>",
      "Renames a library-category",
      LibraryCategory.oRenameCategoryHelpText,
      true,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "library-add-file",
      LibraryAddWizard.LibraryFileAddWizardSetup,
      "g!library-add-file",
      "Begins a wizard to add a file to a category",
      LibraryAddWizard.oAddFileHelpText,
      true,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "library-remove-file",
      LibraryFileRemoveWizardSetup.LibraryFileRemoveWizardSetup,
      "g!library-remove-file",
      "Begins a wizard to remove a file to a category",
      LibraryFileRemoveWizardSetup.oRemoveFileHelpText,
      true,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "library-print",
      LibraryPrint.PrintLibrary,
      "g!library-print <category?>",
      "Print the server's library (or a specific category)",
      LibraryPrint.oPrintHelpText,
      false,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "library-get-file",
      LibraryGetFileWizard.GetLibraryFileWizardSetup,
      "g!library-get-file",
      " Start a wizard to get a library file",
      LibraryGetFileWizard.oGetFileHelpText,
      false,
      "LIBRARY"
    ));
    Globals.aCommandMap.push(new Command(
      "streak",
      Streak.FindStreak,
      "g!streak <string> <channel>",
      "Get the count of how many times a string/emoji/whatever has been pasted in a row",
      Streak.oHelpText,
      false,
      "FUN"
    ));
    Globals.aCommandMap.push(new Command(
      "approve",
      Approve.ParseApprove,
      "g!approve <member>",
      "Approve a member into the server (will update roles based on Options)",
      Approve.oHelpText,
      true,
      "MOD"
    ));
    Globals.aCommandMap.push(new Command(
      "cursed",
      CursedTBL.MakeCursed,
      "g!approve <imageURL or image>",
      "Makes an image super duper cursed",
      CursedTBL.oHelpText,
      false,
      "FUN"
    ));
    Globals.aCommandMap.push(new Command(
      "groovesong",
      GrooveSong.GetSong,
      "g!groovesong ",
      "Gives you a random song from Groove's Spotify playlist!",
      GrooveSong.oHelpText,
      false,
      "GROOVE"
    ));
    Globals.aCommandMap.push(new Command(
      "rep",
      GroovePointsRepHandler.GiveRep,
      "g!rep <member?>",
      "Awards a bunch of GroovePoints to any user in the server (once per day)",
      GroovePointsRepHandler.oHelpText,
      false,
      "GROOVEPOINTS"
    ));
    Globals.aCommandMap.push(new Command(
      "leaderboard",
      GroovePointsLeaderboardHandler.ParseInputForLeaderboard,
      "g!leaderboard <page?>",
      "Shows the leaderboard of GroovePoints for this server",
      GroovePointsLeaderboardHandler.oHelpText,
      false,
      "GROOVEPOINTS"
    ));
    Globals.aCommandMap.push(new Command(
      "daily",
      GroovePointsDailyHandler.HandleDailyPackage,
      "g!daily <member?>",
      "Gives you your daily package of GroovePoints (can be given to another member). Once per day",
      GroovePointsDailyHandler.oHelpText,
      false,
      "GROOVEPOINTS"
    ));
  }




  // {
  //   name: "\"AskOuija:\"",
  //   value: " Starts a ouija question (must set up in Options). Inputs are only one letter messages. Type \"goodbye\" to end. "
  // },
  // {
  //   name: "\"Hey Groovebot, \"",
  //   value: " Starts a question for Groovebot (must set up in Options). Inputs are only one word messages (no spaces). Type \"goodbye\" to end. "
  // }