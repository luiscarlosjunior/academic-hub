import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())
con.execute("INSERT INTO cliente (id, nome, email) VALUES (1, 'Ana', 'ana@x.com')")
con.executemany("INSERT INTO livro (id, titulo, ano) VALUES (?,?,?)", [(1, "Dom Casmurro", 1899), (2, "Vidas Secas", 1938)])

# VIEW: uma consulta salva, tratada como tabela só de leitura
con.execute("""CREATE VIEW vw_emprestimos_abertos AS
               SELECT e.id, l.titulo, c.nome AS cliente, e.data_saida
               FROM emprestimo e
               JOIN livro l   ON l.id = e.livro_id
               JOIN cliente c ON c.id = e.cliente_id
               WHERE e.devolvido = 0""")
con.execute("INSERT INTO emprestimo (livro_id, cliente_id, data_saida) VALUES (1, 1, '2026-10-01')")
con.execute("INSERT INTO emprestimo (livro_id, cliente_id, data_saida, devolvido) VALUES (2, 1, '2026-09-01', 1)")
print("VIEW mostra só os abertos:", con.execute("SELECT titulo, cliente FROM vw_emprestimos_abertos").fetchall())

# TRIGGER: regra que roda sozinha depois de uma inserção
con.execute("CREATE TABLE log_emprestimo (emprestimo_id INTEGER, mensagem TEXT)")
con.execute("""CREATE TRIGGER trg_log_emprestimo AFTER INSERT ON emprestimo
               BEGIN
                 INSERT INTO log_emprestimo VALUES (NEW.id, 'empréstimo registrado para livro ' || NEW.livro_id);
               END""")
con.execute("INSERT INTO emprestimo (livro_id, cliente_id, data_saida) VALUES (2, 1, '2026-10-03')")
print("log gerado pelo trigger:", con.execute("SELECT * FROM log_emprestimo").fetchall())

# TRIGGER de validação: impede devolver um livro duas vezes
con.execute("""CREATE TRIGGER trg_nao_devolver_duas_vezes BEFORE UPDATE OF devolvido ON emprestimo
               WHEN OLD.devolvido = 1 AND NEW.devolvido = 1
               BEGIN SELECT RAISE(ABORT, 'empréstimo já devolvido'); END""")
try:
    con.execute("UPDATE emprestimo SET devolvido = 1 WHERE id = 2")
except sqlite3.IntegrityError as e:
    print("segunda devolução:", "RECUSADA -", e)
