// Importa o módulo Pool da biblioteca pg
const Pool = require('pg').Pool;

// Cria o pool de conexões com o PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

// Testa a conexão com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err.message);
        return;
    }

    console.log('Conexão com PostgreSQL estabelecida com sucesso!');

    release();
});

// Exporta a função de consulta ao banco
module.exports = {
    query: (text, params) => pool.query(text, params)
};