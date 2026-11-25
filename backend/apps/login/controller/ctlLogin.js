//-- apps/login/controller/ctlLogin.js
const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
const mdlLogin = require("../model/mdlLogin");

const Login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ mensagem: "Username e password são obrigatórios." });
  }

  const credencial = await mdlLogin.GetCredencial(username);

  if (credencial.length == 0) {
    return res.status(401).json({ mensagem: "Usuário ou senha inválidos." });
  }

  if (bCrypt.compareSync(password, credencial[0].password)) {
    //auth ok
    const id = credencial[0].id;
    const token = jwt.sign({ id, username }, process.env.SECRET_API, {
      expiresIn: "8h",
    });
    return res.json({
      auth: true,
      token: token,
      usuario: { id, username },
    });
  }

  res.status(401).json({ mensagem: "Usuário ou senha inválidos." });
};

function AutenticaJWT(req, res, next) {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader)
    return res
      .status(401)
      .json({ auth: false, mensagem: "Token não informado." });

  const bearer = tokenHeader.split(" ");
  const token = bearer[1];

  jwt.verify(token, process.env.SECRET_API, function (err, decoded) {
    if (err)
      return res
        .status(401)
        .json({ auth: false, mensagem: "Token inválido ou expirado." });

    req.userId = decoded.id;
    next();
  });
}

const Logout = (req, res, next) => {
  res.json({ auth: false, token: null });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT,
};
