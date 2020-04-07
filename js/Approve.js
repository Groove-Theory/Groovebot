const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');
const EmbeddedHelpText = require("./Classes/EmbeddedHelpText.js");

exports.oHelpText = new EmbeddedHelpText(
  "Approve",
  "Approve a member into the server",
   "``<member>`` Mention of the member to let into the server",
   "",
   "``g!approve @steve`` (Let's the user 'steve' into the server)"
)

exports.ParseApprove = ParseApprove
exports.ApproveMember = ApproveMember
exports.HandleMemberInvite = HandleMemberInvite


async function ParseApprove(client, msg) {
  try {

    var oApprover = msg.member
    if(!oApprover || !oApprover.hasPermission('MANAGE_GUILD'))
    {
      msg.channel.send("Sorry, you need the 'Manage Server' permission to use this command :sob: ");
      return;
    }
    var aMsgContents = msg.content.split(/\s+/);
    let cMember = aMsgContents[1];
    let oGuild = msg.guild;
    let oChannel = msg.channel;
    let oMember = Globals.GetMemberByInput(oGuild, cMember);
    if(!oMember)
    {
        msg.channel.send("Sorry, member not found");
    }

    ApproveMember(client, oGuild, oChannel, oMember);


  }
  catch (err) {
    ErrorHandler.HandleError(client, err);
  }
}


async function ApproveMember(client, oGuild, oChannel, oMember) {

  let bSuccess = false;
  let cReturnMessage = "-"
  var oQueryObject = {
    guildID: oGuild.id,
    production: Globals.Environment.PRODUCTION
  }

  let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);
  var oResult = aResult.length > 0 ? aResult[0] : null;
  if (!oResult) {
      cReturnMessage = "Sorry there was an error getting your server's options. Please try again later"
      return;
  }

  let aAddRolesOnApprove = oResult["addroleonapprove"];
  let aRemoveRolesOnApprove = oResult["removeroleonapprove"];
  let aMemberCurrentRoles = oMember.roles._roles.map(r => r.id);
  let aRolesToAddToMember = aAddRolesOnApprove ? aAddRolesOnApprove.filter(r => aMemberCurrentRoles.indexOf(r) == -1) : [];
  let aRolesToRemoveFromMember = aRemoveRolesOnApprove ? aRemoveRolesOnApprove.filter(r => aMemberCurrentRoles.indexOf(r) > -1) : [];

  oMember.roles.add(aRolesToAddToMember).then(function(oMember){
    oMember.roles.remove(aRolesToRemoveFromMember).then(function(oMember){
      cReturnMessage = `**${oMember.displayName}** has been approved!`
      cReturnMessage = Globals.cleanString(cReturnMessage);
      oChannel.send(cReturnMessage);
    })
  })

  
}


async function HandleMemberInvite(oMember) {

  let oGuild = oMember.guild;
  var oQueryObject = {
    guildID: oGuild.id,
    production: Globals.Environment.PRODUCTION
  }

  let aResult = await Globals.Database.Query("ServerOptions", oQueryObject);
  var oResult = aResult.length > 0 ? aResult[0] : null;
  if (!oResult) {
      cReturnMessage = "Sorry there was an error getting your server's options. Please try again later"
      return;
  }

  let aAddRolesOnApprove = oResult["addroleoninvite"];
  if(aAddRolesOnApprove)
  {
    let aMemberCurrentRoles = oMember.roles._roles.map(r => r.id);
    let aRolesToAddToMember = aAddRolesOnApprove ? aAddRolesOnApprove.filter(r => aMemberCurrentRoles.indexOf(r) == -1) : [];
    await oMember.roles.add(aRolesToAddToMember);
  }
}