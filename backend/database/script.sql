-- =====================================================================
-- ERP PASTEJO ROTACIONADO - Script do banco de dados (PostgreSQL)
-- Pode ser executado mais de uma vez sem erro (IF NOT EXISTS).
--
-- Banco:   CREATE DATABASE erp_pastejo;
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASTO
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pasto (
    pastoid   SERIAL PRIMARY KEY,
    descricao VARCHAR(100)  NOT NULL,
    areatotal NUMERIC(10,2) NOT NULL,
    removido  BOOLEAN       NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- PIQUETE (N:1 com pasto)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS piquete (
    piqueteid SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    latitude  NUMERIC(10,7),
    longitude NUMERIC(10,7),
    pastoidfk INTEGER NOT NULL,
    removido  BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_piquete_pasto
        FOREIGN KEY (pastoidfk) REFERENCES pasto (pastoid)
);

-- ---------------------------------------------------------------------
-- ANIMAL
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animal (
    animalid SERIAL PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    datanasc DATE,
    removido BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- ALOCADO (tabela do relacionamento N:N entre animal e piquete)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alocado (
    alocadoid   SERIAL PRIMARY KEY,
    animalidfk  INTEGER NOT NULL,
    piqueteidfk INTEGER NOT NULL,
    datainicio  DATE    NOT NULL,
    datafinal   DATE,
    removido    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_alocado_animal
        FOREIGN KEY (animalidfk)  REFERENCES animal  (animalid),
    CONSTRAINT fk_alocado_piquete
        FOREIGN KEY (piqueteidfk) REFERENCES piquete (piqueteid)
);

-- ---------------------------------------------------------------------
-- USUARIOS (login - não conta entre as 4 tabelas do trabalho)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id       SERIAL PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    deleted  BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Usuário inicial: admin / admin (senha criptografada com bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (username, password)
VALUES ('admin', crypt('admin', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- ---------------------------------------------------------------------
-- DADOS DE EXEMPLO (só são inseridos se a tabela estiver vazia)
-- ---------------------------------------------------------------------
INSERT INTO pasto (descricao, areatotal)
SELECT * FROM (VALUES
    ('Pasto Norte', 12.50),
    ('Pasto Sul',    8.75)
) AS v(descricao, areatotal)
WHERE NOT EXISTS (SELECT 1 FROM pasto);

INSERT INTO piquete (descricao, latitude, longitude, pastoidfk)
SELECT v.descricao, v.latitude, v.longitude,
       (SELECT pastoid FROM pasto WHERE descricao = v.pasto LIMIT 1)
FROM (VALUES
    ('Piquete 1', -20.4200000, -49.9700000, 'Pasto Norte'),
    ('Piquete 2', -20.4210000, -49.9710000, 'Pasto Norte'),
    ('Piquete 3', -20.4300000, -49.9800000, 'Pasto Sul')
) AS v(descricao, latitude, longitude, pasto)
WHERE NOT EXISTS (SELECT 1 FROM piquete);

INSERT INTO animal (nome, datanasc)
SELECT * FROM (VALUES
    ('Mimosa',  DATE '2022-03-10'),
    ('Estrela', DATE '2021-07-25')
) AS v(nome, datanasc)
WHERE NOT EXISTS (SELECT 1 FROM animal);

INSERT INTO alocado (animalidfk, piqueteidfk, datainicio, datafinal)
SELECT (SELECT animalid  FROM animal  WHERE nome = v.animal    LIMIT 1),
       (SELECT piqueteid FROM piquete WHERE descricao = v.piq  LIMIT 1),
       v.ini, v.fim
FROM (VALUES
    ('Mimosa',  'Piquete 1', DATE '2026-11-01', DATE '2026-11-10'),
    ('Estrela', 'Piquete 3', DATE '2026-11-05', DATE '2026-11-15')
) AS v(animal, piq, ini, fim)
WHERE NOT EXISTS (SELECT 1 FROM alocado);

-- ---------------------------------------------------------------------
-- CONFERÊNCIA (opcional)
-- ---------------------------------------------------------------------
-- SELECT table_name FROM information_schema.tables
--  WHERE table_schema = 'public' ORDER BY table_name;
