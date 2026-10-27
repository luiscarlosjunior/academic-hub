import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())
con.execute("INSERT INTO autor (id, nome) VALUES (1, 'Machado de Assis')")
con.execute("INSERT INTO livro (id, titulo, ano) VALUES (1, 'Dom Casmurro', 1899)")
con.execute("INSERT INTO livro_autor VALUES (1, 1)")
con.execute("INSERT INTO cliente (id, nome, email) VALUES (1, 'Ana', 'ana@x.com')")
con.execute("INSERT INTO emprestimo (livro_id, cliente_id, data_saida) VALUES (1, 1, '2026-10-01')")

# D de CRUD: DELETE. Sempre com WHERE, e conferir antes com SELECT.
print("candidatos:", con.execute("SELECT id, titulo FROM livro WHERE ano < 1900").fetchall())

# ON DELETE RESTRICT: livro com empréstimo não pode ser apagado
try:
    con.execute("DELETE FROM livro WHERE id = 1")
except sqlite3.IntegrityError as e:
    print("apagar livro emprestado:", "RECUSADO -", e)

# ON DELETE CASCADE: apagar o livro leva junto as linhas de livro_autor
con.execute("UPDATE emprestimo SET devolvido = 1")
con.execute("DELETE FROM emprestimo")
cur = con.execute("DELETE FROM livro WHERE id = 1")
print("livro apagado, linhas:", cur.rowcount)
print("vínculos restantes em livro_autor:", con.execute("SELECT count(*) FROM livro_autor").fetchone()[0])
print("autor continua existindo:", con.execute("SELECT nome FROM autor").fetchall())

# Exclusão lógica: marca em vez de apagar (preserva histórico e auditoria)
con.execute("ALTER TABLE autor ADD COLUMN excluido INTEGER NOT NULL DEFAULT 0")
con.execute("UPDATE autor SET excluido = 1 WHERE id = 1")
print("consulta normal depois da exclusão lógica:", con.execute("SELECT nome FROM autor WHERE excluido = 0").fetchall())
