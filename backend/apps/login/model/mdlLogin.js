//-- arquivo apps/login/model/mdlLogin.js
const db = require("../../../database/databaseconfig");

const GetCredencial = async (loginPar) => {
  return (
    await db.query(
      "SELECT id, username, password FROM usuarios WHERE username = $1 AND deleted = false",
      [loginPar]
    )
  ).rows;
};

module.exports = {
  GetCredencial,
};
