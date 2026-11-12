-- Dia 1: roteiro de demonstração, de SELECT simples ao CRUD com transação.
-- Execute: sqlite3 -header -column dia1.db < sql/03-consultas.sql
-- O PRAGMA vale por conexão: sem ele, a chave estrangeira não é verificada.
PRAGMA foreign_keys = ON;

-- 1. SELECT: escolher colunas e linhas
SELECT titulo, ano FROM livro;
SELECT * FROM livro WHERE ano < 1900 ORDER BY ano;
SELECT titulo, preco FROM livro WHERE preco BETWEEN 30 AND 50 ORDER BY preco DESC;
SELECT titulo FROM livro WHERE titulo LIKE '%ca%';

-- 2. Agregação: resumir um conjunto em um número
SELECT COUNT(*) AS total, ROUND(AVG(preco), 2) AS preco_medio FROM livro;

-- 3. JOIN: juntar tabelas pela chave estrangeira
SELECT l.titulo, a.nome
FROM livro l
JOIN livro_autor la ON la.livro_id = l.id
JOIN autor a        ON a.id = la.autor_id
ORDER BY l.titulo;

SELECT a.nome, COUNT(*) AS livros
FROM autor a
JOIN livro_autor la ON la.autor_id = a.id
GROUP BY a.nome
ORDER BY livros DESC, a.nome;

-- 4. INSERT: criar uma linha
INSERT INTO livro (titulo, ano, preco, isbn) VALUES ('Macunaíma', 1928, 29.90, '978-0005');
SELECT id, titulo, preco FROM livro WHERE isbn = '978-0005';

-- 5. UPDATE: alterar linhas que casam com WHERE
UPDATE livro SET preco = ROUND(preco * 1.10, 2) WHERE ano < 1900;
SELECT titulo, preco FROM livro WHERE ano < 1900 ORDER BY titulo;

-- 6. Transação: ou tudo vale, ou nada vale
BEGIN;
DELETE FROM livro WHERE isbn = '978-0005';
ROLLBACK;
SELECT COUNT(*) AS apos_rollback FROM livro;   -- Macunaíma continua lá

BEGIN;
DELETE FROM livro WHERE isbn = '978-0005';
COMMIT;
SELECT COUNT(*) AS apos_commit FROM livro;     -- agora foi removido de vez

-- 7. Restrições: o banco recusa dados inválidos
INSERT INTO livro (titulo, ano, preco) VALUES ('Livro inválido', -5, 10);
INSERT INTO livro (titulo, ano, preco, isbn) VALUES ('Repetido', 2000, 10, '978-0001');

-- 8. Chave estrangeira com ON DELETE CASCADE: apagar o livro apaga o vínculo com o autor
SELECT COUNT(*) AS vinculos_antes FROM livro_autor WHERE livro_id = 4;
DELETE FROM livro WHERE id = 4;
SELECT COUNT(*) AS vinculos_depois FROM livro_autor WHERE livro_id = 4;
