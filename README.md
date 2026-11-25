# ERP Pastejo Rotacionado

Trabalho 03 de Desenvolvimento Web III (IFSP Votuporanga). CRUD de **pasto**, **piquete**, **animal** e **alocado**, com login e JWT.

| Parte | Tecnologia | Porta |
|---|---|---|
| Back-end (API) | Node.js, Express, PostgreSQL, JWT | 40001 |
| Front-end | Node.js, Express, Nunjucks | 40101 |
| Banco de dados | PostgreSQL | 5432 |

O front-end nunca acessa o banco: ele só chama as APIs do back-end.

## 1. Banco de dados
1. Crie o banco `erp_pastejo` (pgAdmin ou `CREATE DATABASE erp_pastejo;`).
2. Execute `backend/database/script.sql` nesse banco. Ele cria as tabelas, o usuário **admin / admin** e dados de exemplo, e pode ser executado várias vezes.

## 2. Variáveis de ambiente
Copie os exemplos e ajuste as senhas (o `.env` real nunca vai para o GitHub):
```
copy backend\.env.example  backend\.env
copy frontend\.env.example frontend\.env
```
- `backend/.env`: `DB_PASS` com a senha do seu PostgreSQL e `SECRET_API` com uma chave qualquer.
  - `DB_HOST=host.docker.internal` para rodar o back-end no Docker.
  - `DB_HOST=localhost` para rodar com `node app.js`.
- `frontend/.env`: `SERVIDOR_DW3=http://localhost:40001` (endereço do back-end acessado pelo navegador).

## 3. Rodando com Docker
Com o Docker Desktop aberto e o PostgreSQL rodando (com o `script.sql` já executado).

Back-end, dentro da pasta `backend`:
```
docker build -t erp_backend_img:1.0 .
docker run -d --name erp_backend_ctner --add-host host.docker.internal:host-gateway --env-file .env -p 40001:40001 --restart unless-stopped erp_backend_img:1.0
```

Front-end, dentro da pasta `frontend`:
```
docker build -t erp_frontend_img:1.0 .
docker run -d --name erp_frontend_ctner --env-file .env -p 40101:40101 --restart unless-stopped erp_frontend_img:1.0
```

Conferir e acessar:
```
docker ps
docker logs erp_backend_ctner
docker logs erp_frontend_ctner
```
Abra http://localhost:40101 e entre com **admin / admin**.

Os arquivos `.env` não vão para a imagem (`.dockerignore`); por isso o `--env-file`.

Para parar e remover os containers:
```
docker stop erp_frontend_ctner erp_backend_ctner
docker rm erp_frontend_ctner erp_backend_ctner
```

## 4. Rodando sem Docker
Em cada pasta (`backend` e `frontend`), em terminais separados:
```
npm install
node app.js
```
No PowerShell do Windows, se o `npm` for bloqueado, use `npm.cmd install`.

## 5. APIs do back-end
Todas exigem `Authorization: Bearer <token>`, exceto `/Login`.

| Operação | Rota (exemplo: Pasto) |
|---|---|
| Login | `POST /Login` |
| Logout | `POST /Logout` |
| GetAll | `GET /getAllPasto` |
| GetByID | `GET /getPastoByID/:pastoid` |
| Insert | `POST /insertPasto` |
| Update | `PUT /updatePasto/:pastoid` |
| Delete (soft delete) | `DELETE /deletePasto/:pastoid` |

O mesmo vale para `Piquete`, `Animal` e `Alocado`.

Formato das respostas (padrão da disciplina):
- GetAll e GetByID: `{ "status": "ok", "registro": [ ... ] }`
- Insert, Update e Delete: `{ "status": "ok", "linhasAfetadas": 1 }`. Em caso de erro do banco, `status` traz a mensagem e `linhasAfetadas` vale -1.

Estrutura do back-end (igual à do repositório da disciplina): `routes/router.js` com todas as rotas, e em cada módulo `apps/<módulo>/controller/ctlX.js`, `model/mdlX.js` e `tests/testX.rest`. Exemplos de chamadas estão em `backend/apps/*/tests/*.rest`.
