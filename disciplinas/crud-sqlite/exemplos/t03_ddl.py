import sqlite3

con = sqlite3.connect(":memory:")

# DDL: CREATE, ALTER, DROP. Aqui, a tabela de teste de tipos.
con.execute("CREATE TABLE tipos (id INTEGER PRIMARY KEY, n INTEGER, r REAL, t TEXT, b BLOB)")

# SQLite usa tipagem por afinidade: o valor é convertido se possível.
con.execute("INSERT INTO tipos (n, r, t, b) VALUES ('42', '3.5', 123, x'DEADBEEF')")
con.execute("INSERT INTO tipos (n, r, t, b) VALUES ('texto livre', 'x', 'ok', NULL)")

print("valores e tipos reais armazenados:")
for row in con.execute("SELECT id, n, typeof(n), r, typeof(r), t, typeof(t) FROM tipos"):
    print("  ", row)

# ALTER TABLE: adicionar, renomear e remover colunas
con.execute("ALTER TABLE tipos ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1")
con.execute("ALTER TABLE tipos RENAME COLUMN t TO descricao")
con.execute("ALTER TABLE tipos DROP COLUMN b")
print("\ncolunas após ALTER:", [c[1] for c in con.execute("PRAGMA table_info(tipos)")])

# DROP TABLE remove a tabela e os dados. Não há lixeira.
con.execute("DROP TABLE tipos")
print("tabelas após DROP:", con.execute("SELECT count(*) FROM sqlite_master WHERE type='table'").fetchone()[0])
