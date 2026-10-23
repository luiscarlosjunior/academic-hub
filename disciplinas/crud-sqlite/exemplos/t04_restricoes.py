import sqlite3

def tentar(con, sql, params=()):
    try:
        con.execute(sql, params)
        return "aceito"
    except sqlite3.IntegrityError as e:
        return "RECUSADO: " + str(e)

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())

print("1. NOT NULL:")
print("  ", tentar(con, "INSERT INTO autor (nome) VALUES (NULL)"))

print("2. UNIQUE (isbn):")
con.execute("INSERT INTO livro (titulo, ano, isbn) VALUES ('Dom Casmurro', 1899, '978-1')")
print("  ", tentar(con, "INSERT INTO livro (titulo, ano, isbn) VALUES ('Outro', 2000, '978-1')"))

print("3. CHECK (ano > 0):")
print("  ", tentar(con, "INSERT INTO livro (titulo, ano) VALUES ('Sem ano', -5)"))

print("4. DEFAULT (preco sem valor informado):")
con.execute("INSERT INTO livro (titulo, ano) VALUES ('Padrão', 2010)")
print("  ", con.execute("SELECT titulo, preco FROM livro WHERE titulo = 'Padrão'").fetchone())

print("5. FOREIGN KEY com PRAGMA foreign_keys = ON:")
con.execute("INSERT INTO cliente (nome, email) VALUES ('Ana', 'ana@x.com')")
print("  ", tentar(con, "INSERT INTO emprestimo (livro_id, cliente_id, data_saida) VALUES (999, 1, '2026-10-01')"))

print("6. Mesma regra com a chave estrangeira DESLIGADA (padrão antigo do SQLite):")
con2 = sqlite3.connect(":memory:")
con2.execute("CREATE TABLE pai (id INTEGER PRIMARY KEY)")
con2.execute("CREATE TABLE filho (pai_id INTEGER REFERENCES pai(id))")
print("  ", tentar(con2, "INSERT INTO filho (pai_id) VALUES (999)"), "-> sem PRAGMA, a regra é ignorada")
