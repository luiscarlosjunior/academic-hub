import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())
con.executemany("INSERT INTO autor (id, nome) VALUES (?,?)",
                [(1, "Machado de Assis"), (2, "Graciliano Ramos"), (3, "Autor sem livro")])
con.executemany("INSERT INTO livro (id, titulo, ano, preco) VALUES (?,?,?,?)",
                [(1, "Dom Casmurro", 1899, 29.9), (2, "Vidas Secas", 1938, 24.5), (3, "Livro sem autor", 2000, 10.0)])
# N:N: um livro pode ter vários autores, e um autor vários livros
con.executemany("INSERT INTO livro_autor (livro_id, autor_id) VALUES (?,?)",
                [(1, 1), (2, 2)])

print("INNER JOIN (só o que tem par nas duas tabelas):")
for r in con.execute("""SELECT l.titulo, a.nome FROM livro l
                        JOIN livro_autor la ON la.livro_id = l.id
                        JOIN autor a ON a.id = la.autor_id ORDER BY l.id"""):
    print("  ", r)

print("\nLEFT JOIN (todos os livros, com ou sem autor):")
for r in con.execute("""SELECT l.titulo, a.nome FROM livro l
                        LEFT JOIN livro_autor la ON la.livro_id = l.id
                        LEFT JOIN autor a ON a.id = la.autor_id ORDER BY l.id"""):
    print("  ", r)

print("\n1:N: cliente com seus empréstimos")
con.execute("INSERT INTO cliente (id, nome, email) VALUES (1, 'Ana', 'ana@x.com')")
con.executemany("INSERT INTO emprestimo (livro_id, cliente_id, data_saida) VALUES (?,?,?)",
                [(1, 1, "2026-10-01"), (2, 1, "2026-10-05")])
for r in con.execute("""SELECT c.nome, count(e.id) AS emprestimos FROM cliente c
                        LEFT JOIN emprestimo e ON e.cliente_id = c.id GROUP BY c.id"""):
    print("  ", r)
