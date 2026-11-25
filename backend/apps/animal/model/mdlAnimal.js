//-- arquivo apps/animal/model/mdlAnimal.js
const db = require("../../../database/databaseconfig");

const GetAllAnimal = async () => {
  return (
    await db.query(
      "SELECT *" +
      " FROM animal" +
      " WHERE removido = false" +
      " ORDER BY animalid ASC"
    )
  ).rows;
};

const GetAnimalByID = async (animalIDPar) => {
  return (
    await db.query(
      "SELECT *" +
      " FROM animal" +
      " WHERE animalid = $1 AND removido = false",
      [animalIDPar]
    )
  ).rows;
};

const InsertAnimal = async (animalREGPar) => {
  //@ Atenção: aqui já começamos a utilizar a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO animal (nome, datanasc) " + "VALUES ($1, $2)",
        [
          animalREGPar.nome,
          animalREGPar.datanasc,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal|InsertAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdateAnimal = async (animalIDPar, animalREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET " +
          "nome = $2," +
          "datanasc = $3 " +
          "WHERE animalid = $1 AND removido = false",
        [
          animalIDPar,
          animalREGPar.nome,
          animalREGPar.datanasc,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal|UpdateAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeleteAnimal = async (animalIDPar) => {
  //@ Soft delete: o registro não é apagado, apenas o campo removido passa a ser true.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET " + "removido = true " + "WHERE animalid = $1 AND removido = false",
        [animalIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal|DeleteAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAnimal,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};
