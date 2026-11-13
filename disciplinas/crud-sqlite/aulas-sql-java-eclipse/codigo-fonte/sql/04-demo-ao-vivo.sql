-- =====================================================================
-- Demonstração ao vivo (Dia 1): o professor digita e a turma acompanha.
-- Cada bloco corresponde a um slide. Rode bloco por bloco, ou tudo junto:
--   rm -f ao-vivo.db
--   sqlite3 ao-vivo.db < sql/04-demo-ao-vivo.sql
-- Os comentários "-- ERRO ESPERADO" são comandos que DEVEM falhar.
-- =====================================================================

.headers on
.mode column
PRAGMA foreign_keys = ON;

-- ---------- Bloco 1 (slide 6 e 11): criar o modelo ----------
CREATE TABLE livro (
    id     INTEGER PRIMARY KEY,
    titulo TEXT    NOT NULL,
    ano    INTEGER NOT NULL CHECK (ano > 0),
    preco  REAL    NOT NULL DEFAULT 0 CHECK (preco >= 0),
    isbn   TEXT    UNIQUE
);

CREATE TABLE autor (
    id   INTEGER PRIMARY KEY,
    nome TEXT    NOT NULL
);

CREATE TABLE livro_autor (
    livro_id INTEGER NOT NULL REFERENCES livro(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES autor(id) ON DELETE CASCADE,
    PRIMARY KEY (livro_id, autor_id)
);

-- Confira o que foi criado
.tables

-- ---------- Bloco 2 (slide 12): inserir dados ----------
INSERT INTO livro (titulo, ano, preco, isbn) VALUES
    ('Dom Casmurro',      1899, 39.90, '978-0001'),
    ('Memórias Póstumas', 1881, 35.00, '978-0002'),
    ('Iracema',           1865, 22.50, '978-0003'),
    ('Capitães da Areia', 1937, 48.00, '978-0004');

INSERT INTO autor (nome) VALUES ('Machado de Assis'), ('José de Alencar'), ('Jorge Amado');

INSERT INTO livro_autor (livro_id, autor_id) VALUES (1, 1), (2, 1), (3, 2), (4, 3);

SELECT COUNT(*) AS livros FROM livro;

-- ---------- Bloco 3 (slides 8 e 9): SELECT, WHERE, ORDER BY, LIMIT ----------
SELECT titulo, ano FROM livro;

SELECT * FROM livro WHERE ano < 1900 ORDER BY ano;

SELECT titulo FROM livro ORDER BY ano DESC LIMIT 2;

SELECT titulo FROM livro WHERE titulo LIKE '%ca%';

-- ---------- Bloco 4 (slide 10): agregação ----------
SELECT COUNT(*) AS total, ROUND(AVG(preco), 2) AS preco_medio FROM livro;

-- Quantos livros por autor (um grupo por autor)
SELECT a.nome, COUNT(la.livro_id) AS livros
FROM autor a
LEFT JOIN livro_autor la ON la.autor_id = a.id
GROUP BY a.id
ORDER BY livros DESC, a.nome;

-- Só os autores com mais de um livro (HAVING filtra grupos)
SELECT a.nome, COUNT(*) AS livros
FROM autor a
JOIN livro_autor la ON la.autor_id = a.id
GROUP BY a.id
HAVING COUNT(*) > 1;

-- ---------- Bloco 5 (slide 11): JOIN no N:N ----------
SELECT l.titulo, a.nome
FROM livro l
JOIN livro_autor la ON la.livro_id = l.id
JOIN autor a        ON a.id = la.autor_id
ORDER BY l.titulo;

-- ---------- Bloco 6 (slide 13): UPDATE e DELETE, sempre com WHERE ----------
-- Passo 1: confira com SELECT quais linhas vão mudar
SELECT titulo, preco FROM livro WHERE ano < 1900;

-- Passo 2: só então altere
UPDATE livro SET preco = ROUND(preco * 1.10, 2) WHERE ano < 1900;
SELECT titulo, preco FROM livro WHERE ano < 1900 ORDER BY titulo;

-- UPDATE com subconsulta: sem digitar o id do autor
UPDATE livro SET preco = preco + 5
WHERE id IN (SELECT livro_id FROM livro_autor
             WHERE autor_id = (SELECT id FROM autor WHERE nome = 'Jorge Amado'));
SELECT titulo, preco FROM livro WHERE titulo = 'Capitães da Areia';

-- INSERT e DELETE de um livro novo
INSERT INTO livro (titulo, ano, preco, isbn) VALUES ('Macunaíma', 1928, 29.90, '978-0005');
SELECT id, titulo FROM livro WHERE isbn = '978-0005';
DELETE FROM livro WHERE isbn = '978-0005';
SELECT COUNT(*) AS livros_depois_do_delete FROM livro;

-- ---------- Bloco 7 (slide 14): transação ----------
BEGIN;
DELETE FROM livro WHERE isbn = '978-0004';
SELECT COUNT(*) AS dentro_da_transacao FROM livro;
ROLLBACK;
SELECT COUNT(*) AS depois_do_rollback FROM livro;

BEGIN;
DELETE FROM livro WHERE isbn = '978-0004';
COMMIT;
SELECT COUNT(*) AS depois_do_commit FROM livro;

-- Devolve o livro apagado para o resto da demonstração
INSERT INTO livro (titulo, ano, preco, isbn) VALUES ('Capitães da Areia', 1937, 48.00, '978-0004');
INSERT INTO livro_autor (livro_id, autor_id)
    SELECT id, (SELECT id FROM autor WHERE nome = 'Jorge Amado')
    FROM livro WHERE isbn = '978-0004';

-- ---------- Bloco 8 (slide 15): restrições ----------
-- ERRO ESPERADO: CHECK constraint failed
INSERT INTO livro (titulo, ano, preco, isbn) VALUES ('Livro sem ano', 0, 10, '978-9999');

-- ERRO ESPERADO: UNIQUE constraint failed: livro.isbn
INSERT INTO livro (titulo, ano, preco, isbn) VALUES ('Repetido', 2000, 10, '978-0001');

-- ERRO ESPERADO: NOT NULL constraint failed: livro.titulo
INSERT INTO livro (titulo, ano, preco, isbn) VALUES (NULL, 2000, 10, '978-9998');

-- ERRO ESPERADO: FOREIGN KEY constraint failed (autor 999 não existe)
INSERT INTO livro_autor (livro_id, autor_id) VALUES (1, 999);

-- ---------- Bloco 9 (slide 15): ON DELETE CASCADE ----------
-- Apagar o autor apaga só os vínculos. Os livros continuam.
SELECT COUNT(*) AS vinculos_antes FROM livro_autor;
DELETE FROM autor WHERE nome = 'José de Alencar';
SELECT COUNT(*) AS vinculos_depois FROM livro_autor;
SELECT COUNT(*) AS livros_depois FROM livro;

-- Apagar um livro também apaga os vínculos dele (ON DELETE CASCADE em livro_autor).
SELECT COUNT(*) AS vinculos_do_dom_casmurro FROM livro_autor WHERE livro_id = 1;
DELETE FROM livro WHERE id = 1;
SELECT COUNT(*) AS vinculos_do_dom_casmurro_depois FROM livro_autor WHERE livro_id = 1;
