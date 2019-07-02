exports.bProduction = (process.env.PRODUCTION == 1 || process.env.PRODUCTION == "1");
///////////////////TEST VARS////////////////////////////////////////

exports.g_mainChannelIDs = ["565734515113328650", "570056315989262346"];
exports.g_copyChannelIDs = ["571578458124320768", "570056992002015243"];

exports.g_GuildID = "470626956946309144";
exports.g_SparticistRole = "559075046245793823"
exports.g_CodeMasterRoleID = "563795804465135644"
exports.g_CouncilpersonRoleID = "563871903203196943"

exports.g_OuijaChannelID = "558156350320803851"

exports.g_VentriloquistInputChannelID = "595634269599039539"
exports.g_VentriloquistOutputChannelID = "565734515113328650"

exports.g_RulesChannel1 = "570056315989262346";
exports.g_RulesChannel2 = "570056315989262346"

///////////////////PRODUCTION VARS////////////////////////////////////////
if (exports.bProduction)
{
  // TODO: We really need to figure out some MongoDB stuff here 
  exports.g_mainChannelID = ["526080760101470230", "570056315989262346"];
  exports.g_copyChannelID = ["558159040371228683", "570056992002015243"];

  exports.g_GuildID = "526080760101470228";
  exports.g_SparticistRole = "526109092792762368" //"526109092792762368"
  exports.g_CodeMasterRoleID = "563903645104603158"
  exports.g_CouncilpersonRoleID = "526081028683726888"

  exports.g_OuijaChannelID = "559786059572183060"

  exports.g_VentriloquistInputChannelID = "561403085419839505"
  exports.g_VentriloquistOutputChannelID = "526082151062568960"

  exports.g_RulesChannelID1 = "570056315989262346"
  exports.g_RulesChannelID2 = "526084321220493314"
}


/////// NOT PRODUCTION DEPENDENT ///////

exports.aGrooveQuotes = null;
exports.aCompliments = null;

exports.g_GitLink = "https://github.com/Groove-Theory/Groovebot";

exports.g_GrooveID = "193800300518309888";
