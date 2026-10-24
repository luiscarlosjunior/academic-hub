import sqlite3

# Conceito 1: tabela = conjunto de linhas com as mesmas colunas
# Conceito 2: chave primária identifica uma linha de forma única
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE autor (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)")
con.execute("INSERT INTO autor (id, nome) VALUES (1, 'Clarice Lispector')")

print("linha com id 1 :", con.execute("SELECT * FROM autor WHERE id = 1").fetchone())
try:
    con.execute("INSERT INTO autor (id, nome) VALUES (1, 'Outro nome')")
except sqlite3.IntegrityError as e:
    print("chave repetida:", e)

# Conceito 3: linguagem SQL em categorias
#   DDL (definição): CREATE, ALTER, DROP
#   DML (manipulação): INSERT, UPDATE, DELETE
#   DQL (consulta): SELECT
#   TCL (transação): BEGIN, COMMIT, ROLLBACK, SAVEPOINT
#   DCL (controle): GRANT, REVOKE  -> o SQLite não tem usuários; o controle é o do arquivo
print("\ntabelas no banco:", [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")])
print("arquivo de banco em memória?", con.execute("PRAGMA database_list").fetchone()[2] == "")
