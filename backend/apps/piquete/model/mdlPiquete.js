//-- arquivo apps/piquete/model/mdlPiquete.js
const db = require("../../../database/databaseconfig");

const GetAllPiquete = async () => {
  return (
    await db.query(
      "SELECT piquete.*, pasto.descricao AS pastodescricao" +
      " FROM piquete" +
      " INNER JOIN pasto ON piquete.pastoidfk = pasto.pastoid" +
      " WHERE piquete.removido = false" +
      " ORDER BY piquete.piqueteid ASC"
    )
  ).rows;
};

const GetPiqueteByID = async (piqueteIDPar) => {
  return (
    await db.query(
      "SELECT piquete.*, pasto.descricao AS pastodescricao" +
      " FROM piquete" +
      " INNER JOIN pasto ON piquete.pastoidfk = pasto.pastoid" +
      " WHERE piquete.piqueteid = $1 AND piquete.removido = false",
      [piqueteIDPar]
    )
  ).rows;
};

const InsertPiquete = async (piqueteREGPar) => {
  //@ Atenção: aqui já começamos a utilizar a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO piquete (descricao, latitude, longitude, pastoidfk) " + "VALUES ($1, $2, $3, $4)",
        [
          piqueteREGPar.descricao,
          piqueteREGPar.latitude,
          piqueteREGPar.longitude,
          piqueteREGPar.pastoidfk,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete|InsertPiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdatePiquete = async (piqueteIDPar, piqueteREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET " +
          "descricao = $2," +
          "latitude = $3," +
          "longitude = $4," +
          "pastoidfk = $5 " +
          "WHERE piqueteid = $1 AND removido = false",
        [
          piqueteIDPar,
          piqueteREGPar.descricao,
          piqueteREGPar.latitude,
          piqueteREGPar.longitude,
          piqueteREGPar.pastoidfk,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete|UpdatePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeletePiquete = async (piqueteIDPar) => {
  //@ Soft delete: o registro não é apagado, apenas o campo removido passa a ser true.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET " + "removido = true " + "WHERE piqueteid = $1 AND removido = false",
        [piqueteIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete|DeletePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPiquete,
  GetPiqueteByID,
  InsertPiquete,
  UpdatePiquete,
  DeletePiquete,
};
