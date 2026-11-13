-- =====================================================
-- GABARITO: Escola de idiomas
-- Rode com: sqlite3 escola.db < gabarito.sql
-- =====================================================

PRAGMA foreign_keys = ON;

-- ---------- PARTE A: criar as tabelas ----------
DROP TABLE IF EXISTS matricula;
DROP TABLE IF EXISTS curso;
DROP TABLE IF EXISTS aluno;

CREATE TABLE aluno (
  id      INTEGER PRIMARY KEY,
  nome    TEXT NOT NULL,
  email   TEXT NOT NULL UNIQUE,
  cidade  TEXT
);

CREATE TABLE curso (
  id          INTEGER PRIMARY KEY,
  idioma      TEXT NOT NULL,
  nivel       TEXT NOT NULL CHECK (nivel IN ('basico', 'intermediario', 'avancado')),
  mensalidade REAL NOT NULL CHECK (mensalidade > 0)
);

CREATE TABLE matricula (
  id        INTEGER PRIMARY KEY,
  aluno_id  INTEGER NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
  curso_id  INTEGER NOT NULL REFERENCES curso(id),
  data      TEXT NOT NULL,
  nota      REAL CHECK (nota IS NULL OR (nota >= 0 AND nota <= 10)),
  UNIQUE (aluno_id, curso_id)
);

-- ---------- PARTE B: inserir dados ----------
INSERT INTO aluno (nome, email, cidade) VALUES
  ('Ana Souza',   'ana@exemplo.com',   'Recife'),
  ('Bruno Lima',  'bruno@exemplo.com', 'Olinda'),
  ('Carla Dias',  'carla@exemplo.com', 'Recife'),
  ('Diego Melo',  'diego@exemplo.com', 'Paulista');

INSERT INTO curso (idioma, nivel, mensalidade) VALUES
  ('Inglês',    'basico',         250.00),
  ('Inglês',    'avancado',       320.00),
  ('Espanhol',  'basico',         230.00),
  ('Francês',   'intermediario',  280.00);

INSERT INTO matricula (aluno_id, curso_id, data, nota) VALUES
  (1, 1, '2026-02-10', 8.5),
  (1, 2, '2026-03-01', NULL),
  (2, 1, '2026-02-10', 6.0),
  (3, 3, '2026-02-15', 9.0),
  (3, 4, '2026-03-05', 7.5);

-- ---------- PARTE C: consultas e alterações ----------

-- C1 (SELECT + WHERE + ORDER BY)
SELECT nome FROM aluno WHERE cidade = 'Recife' ORDER BY nome;

-- C2 (JOIN)
SELECT a.nome, c.idioma, c.nivel
FROM matricula m
JOIN aluno a ON a.id = m.aluno_id
JOIN curso c ON c.id = m.curso_id
ORDER BY a.nome, c.id;

-- C3 (LEFT JOIN: alunos sem matrícula)
SELECT a.nome
FROM aluno a
LEFT JOIN matricula m ON m.aluno_id = a.id
WHERE m.id IS NULL;

-- C4 (INSERT de um novo aluno)
INSERT INTO aluno (nome, email, cidade) VALUES ('Elisa Rocha', 'elisa@exemplo.com', 'Jaboatão');
SELECT COUNT(*) FROM aluno;

-- C5 (UPDATE com WHERE: reajuste de 10% no Inglês básico)
UPDATE curso
SET mensalidade = ROUND(mensalidade * 1.10, 2)
WHERE idioma = 'Inglês' AND nivel = 'basico';
SELECT id, idioma, nivel, mensalidade FROM curso WHERE idioma = 'Inglês' ORDER BY id;

-- C6 (UPDATE com subconsulta: nota do Bruno no Inglês básico)
UPDATE matricula
SET nota = 7.0
WHERE aluno_id = (SELECT id FROM aluno WHERE nome = 'Bruno Lima')
  AND curso_id = 1;
SELECT nota FROM matricula WHERE aluno_id = 2;

-- C7 (erros esperados: rode um de cada vez e leia a mensagem)
-- INSERT INTO matricula (aluno_id, curso_id, data) VALUES (1, 1, '2026-04-01');
--   -> Erro: UNIQUE constraint failed: matricula.aluno_id, matricula.curso_id
-- INSERT INTO curso (idioma, nivel, mensalidade) VALUES ('Italiano', 'expert', 200);
--   -> Erro: CHECK constraint failed
-- INSERT INTO matricula (aluno_id, curso_id, data) VALUES (99, 1, '2026-04-01');
--   -> Erro: FOREIGN KEY constraint failed

-- C8 (DELETE de uma matrícula específica)
DELETE FROM matricula WHERE aluno_id = 1 AND curso_id = 2;
SELECT COUNT(*) AS matriculas_restantes FROM matricula;

-- C9 (DELETE em cascata: apagar o Bruno apaga a matrícula dele)
DELETE FROM aluno WHERE nome = 'Bruno Lima';
SELECT COUNT(*) AS matriculas_depois_do_delete FROM matricula;

-- C10 (erro esperado: não dá para apagar um curso que tem matrícula)
-- DELETE FROM curso WHERE id = 1;
--   -> Erro: FOREIGN KEY constraint failed

-- C11 (GROUP BY + HAVING: cursos com pelo menos 1 matrícula)
SELECT c.idioma, c.nivel, COUNT(m.id) AS alunos
FROM curso c
JOIN matricula m ON m.curso_id = c.id
GROUP BY c.id
HAVING COUNT(m.id) >= 1
ORDER BY c.id;

-- ---------- PARTE D: evoluir a modelagem (professor) ----------
CREATE TABLE professor (
  id            INTEGER PRIMARY KEY,
  nome          TEXT NOT NULL,
  especialidade TEXT
);

ALTER TABLE curso ADD COLUMN professor_id INTEGER REFERENCES professor(id);

INSERT INTO professor (nome, especialidade) VALUES
  ('Marta Viana', 'Inglês'),
  ('Pedro Alves', 'Espanhol e Francês');

UPDATE curso SET professor_id = 1 WHERE idioma = 'Inglês';
UPDATE curso SET professor_id = 2 WHERE idioma IN ('Espanhol', 'Francês');

SELECT c.idioma, c.nivel, p.nome AS professor
FROM curso c
LEFT JOIN professor p ON p.id = c.professor_id
ORDER BY c.id;
