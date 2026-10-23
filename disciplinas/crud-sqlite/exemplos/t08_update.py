import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())
con.executemany("INSERT INTO livro (id, titulo, ano, isbn, preco) VALUES (?,?,?,?,?)", [
    (1, "Dom Casmurro", 1899, "978-1", 29.9),
    (2, "Vidas Secas", 1938, "978-3", 24.5),
])

# U de CRUD: UPDATE com WHERE. Sem WHERE, TODAS as linhas mudam.
cur = con.execute("UPDATE livro SET preco = preco * 1.10 WHERE ano < 1900")
print("linhas alteradas:", cur.rowcount)
print(con.execute("SELECT titulo, round(preco, 2) FROM livro").fetchall())

# UPDATE ... RETURNING: devolve o registro alterado
print("RETURNING:", con.execute("UPDATE livro SET preco = 19.9 WHERE id = 2 RETURNING titulo, preco").fetchone())

# UPSERT: insere, ou atualiza se a chave única já existir
for isbn, preco in [("978-1", 31.0), ("978-9", 15.0)]:
    con.execute("""INSERT INTO livro (titulo, ano, isbn, preco) VALUES ('Título', 2000, ?, ?)
                   ON CONFLICT (isbn) DO UPDATE SET preco = excluded.preco""", (isbn, preco))
print("após UPSERT:", con.execute("SELECT isbn, preco FROM livro ORDER BY isbn").fetchall())

# Atualização segura: a condição inclui o valor esperado (controle otimista)
antigo = 31.0
cur = con.execute("UPDATE livro SET preco = 35.0 WHERE isbn = '978-1' AND preco = ?", (antigo,))
print("atualização condicional aceita:", cur.rowcount == 1)
cur = con.execute("UPDATE livro SET preco = 36.0 WHERE isbn = '978-1' AND preco = ?", (antigo,))
print("segunda tentativa com valor antigo aceita:", cur.rowcount == 1)
