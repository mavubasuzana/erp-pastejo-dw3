// Arquivo: routes/rtIndex.js

var express = require('express');
var router = express.Router();

// Rota principal
router.get('/', function(req, res) {
    res.render('index.njk', {
        // Endereço do back-end vindo do .env (o JS do navegador não lê o .env)
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

module.exports = router;