//-- arquivo apps/pasto/model/mdlPasto.js
const db = require("../../../database/databaseconfig");

const GetAllPasto = async () => {
  return (
    await db.query(
      "SELECT *" +
      " FROM pasto" +
      " WHERE removido = false" +
      " ORDER BY pastoid ASC"
    )
  ).rows;
};

const GetPastoByID = async (pastoIDPar) => {
  return (
    await db.query(
      "SELECT *" +
      " FROM pasto" +
      " WHERE pastoid = $1 AND removido = false",
      [pastoIDPar]
    )
  ).rows;
};

const InsertPasto = async (pastoREGPar) => {
  //@ Atenção: aqui já começamos a utilizar a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO pasto (descricao, areatotal) " + "VALUES ($1, $2)",
        [
          pastoREGPar.descricao,
          pastoREGPar.areatotal,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto|InsertPasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdatePasto = async (pastoIDPar, pastoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET " +
          "descricao = $2," +
          "areatotal = $3 " +
          "WHERE pastoid = $1 AND removido = false",
        [
          pastoIDPar,
          pastoREGPar.descricao,
          pastoREGPar.areatotal,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto|UpdatePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeletePasto = async (pastoIDPar) => {
  //@ Soft delete: o registro não é apagado, apenas o campo removido passa a ser true.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET " + "removido = true " + "WHERE pastoid = $1 AND removido = false",
        [pastoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto|DeletePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPasto,
  GetPastoByID,
  InsertPasto,
  UpdatePasto,
  DeletePasto,
};
