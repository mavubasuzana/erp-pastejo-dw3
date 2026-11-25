// Arquivo: app.js

var express = require('express');
var path = require('path');
var nunjucks = require('nunjucks');

var indexRouter = require('./routes/rtIndex');

require('dotenv').config({
    path: path.join(__dirname, '.env'),
    quiet: true
});

var app = express();

var viewsPath = path.join(__dirname, 'views');
var appsPath = path.join(__dirname, 'apps');

const port = process.env.PORT || 40101;

app.set('views', [viewsPath, appsPath]);
app.set('view engine', 'njk');

nunjucks.configure([viewsPath, appsPath], {
    autoescape: true,
    express: app,
    noCache: app.get('env') === 'development'
});

// Configuração dos middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/', indexRouter);

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor Front-End rodando na porta ${port}`);
});