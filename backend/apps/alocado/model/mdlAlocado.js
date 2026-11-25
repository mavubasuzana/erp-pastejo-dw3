//-- arquivo apps/alocado/model/mdlAlocado.js
const db = require("../../../database/databaseconfig");

const GetAllAlocado = async () => {
  return (
    await db.query(
      "SELECT alocado.*, animal.nome AS animalnome, piquete.descricao AS piquetedescricao" +
      " FROM alocado" +
      " INNER JOIN animal ON alocado.animalidfk = animal.animalid" +
      " INNER JOIN piquete ON alocado.piqueteidfk = piquete.piqueteid" +
      " WHERE alocado.removido = false" +
      " ORDER BY alocado.alocadoid ASC"
    )
  ).rows;
};

const GetAlocadoByID = async (alocadoIDPar) => {
  return (
    await db.query(
      "SELECT alocado.*, animal.nome AS animalnome, piquete.descricao AS piquetedescricao" +
      " FROM alocado" +
      " INNER JOIN animal ON alocado.animalidfk = animal.animalid" +
      " INNER JOIN piquete ON alocado.piqueteidfk = piquete.piqueteid" +
      " WHERE alocado.alocadoid = $1 AND alocado.removido = false",
      [alocadoIDPar]
    )
  ).rows;
};

const InsertAlocado = async (alocadoREGPar) => {
  //@ Atenção: aqui já começamos a utilizar a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO alocado (animalidfk, piqueteidfk, datainicio, datafinal) " + "VALUES ($1, $2, $3, $4)",
        [
          alocadoREGPar.animalidfk,
          alocadoREGPar.piqueteidfk,
          alocadoREGPar.datainicio,
          alocadoREGPar.datafinal,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado|InsertAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdateAlocado = async (alocadoIDPar, alocadoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET " +
          "animalidfk = $2," +
          "piqueteidfk = $3," +
          "datainicio = $4," +
          "datafinal = $5 " +
          "WHERE alocadoid = $1 AND removido = false",
        [
          alocadoIDPar,
          alocadoREGPar.animalidfk,
          alocadoREGPar.piqueteidfk,
          alocadoREGPar.datainicio,
          alocadoREGPar.datafinal,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado|UpdateAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeleteAlocado = async (alocadoIDPar) => {
  //@ Soft delete: o registro não é apagado, apenas o campo removido passa a ser true.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET " + "removido = true " + "WHERE alocadoid = $1 AND removido = false",
        [alocadoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado|DeleteAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAlocado,
  GetAlocadoByID,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};
