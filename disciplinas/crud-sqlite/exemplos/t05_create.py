import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())

# C de CRUD: INSERT simples, com retorno do id gerado
cur = con.execute("INSERT INTO autor (nome) VALUES (?)", ("Machado de Assis",))
print("id gerado:", cur.lastrowid)

# Vários registros de uma vez
con.executemany("INSERT INTO autor (nome) VALUES (?)",
                [("Clarice Lispector",), ("Graciliano Ramos",)])

# RETURNING (SQLite 3.35+): devolve os dados inseridos, sem nova consulta
linha = con.execute(
    "INSERT INTO livro (titulo, ano, isbn, preco) VALUES (?, ?, ?, ?) RETURNING id, titulo",
    ("Memórias Póstumas", 1881, "978-2", 39.9)).fetchone()
print("RETURNING:", linha)

# Parametrização: nunca monte SQL com f-string a partir de dados do usuário
entrada_maliciosa = "x'); DROP TABLE autor; --"
con.execute("INSERT INTO autor (nome) VALUES (?)", (entrada_maliciosa,))
print("tabela autor ainda existe:", con.execute("SELECT count(*) FROM autor").fetchone()[0], "registros")
print("nome guardado literalmente:", con.execute("SELECT nome FROM autor WHERE id = last_insert_rowid()").fetchone()[0])
con.commit()
