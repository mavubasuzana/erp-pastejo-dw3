//-- arquivo apps/alocado/controller/ctlAlocado.js
const mdlAlocado = require("../model/mdlAlocado");

const GetAllAlocado = (req, res) =>
  (async () => {
    let registro = await mdlAlocado.GetAllAlocado();
    for (let i = 0; i < registro.length; i++) {
      const row = registro[i];
      // Elimina parte final de uma variável data com essa: 2000-01-23T01:23:45.123
      if (row.datainicio) {
        row.datainicio = row.datainicio.toISOString().split("T")[0];
      }
      if (row.datafinal) {
        row.datafinal = row.datafinal.toISOString().split("T")[0];
      }
    }
    res.json({ status: "ok", registro: registro });
  })();

const GetAlocadoByID = (req, res) =>
  (async () => {
    const alocadoID = parseInt(req.params.alocadoid);
    let registro = await mdlAlocado.GetAlocadoByID(alocadoID);
    for (let i = 0; i < registro.length; i++) {
      const row = registro[i];
      // Elimina parte final de uma variável data com essa: 2000-01-23T01:23:45.123
      if (row.datainicio) {
        row.datainicio = row.datainicio.toISOString().split("T")[0];
      }
      if (row.datafinal) {
        row.datafinal = row.datafinal.toISOString().split("T")[0];
      }
    }
    res.json({ status: "ok", registro: registro });
  })();

const InsertAlocado = (request, res) =>
  (async () => {
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocado.InsertAlocado(alocadoREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const UpdateAlocado = (request, res) =>
  (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocado.UpdateAlocado(alocadoID, alocadoREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const DeleteAlocado = (request, res) =>
  (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    let { msg, linhasAfetadas } = await mdlAlocado.DeleteAlocado(alocadoID);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

module.exports = {
  GetAllAlocado,
  GetAlocadoByID,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};
