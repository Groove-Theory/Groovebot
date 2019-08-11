/* eslint-disable no-console */
const ParseError = require("parse-error");
const Globals = require("./Globals.js");

exports.HandleError = function HandleError(client, err) {
  const oGrooveUser = client.users.get(Globals.g_GrooveID);
  oGrooveUser.send(
    `__**RUNTIME ERROR**__ \r\n\r\n${err.stack ? err.stack : err}`
  );
  console.log(ParseError(err));
};