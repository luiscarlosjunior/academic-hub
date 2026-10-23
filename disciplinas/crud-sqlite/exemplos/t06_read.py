import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())
con.executemany("INSERT INTO livro (titulo, ano, isbn, preco) VALUES (?,?,?,?)", [
    ("Dom Casmurro", 1899, "978-1", 29.9),
    ("Memórias Póstumas", 1881, "978-2", 39.9),
    ("Vidas Secas", 1938, "978-3", 24.5),
    ("Capitães da Areia", 1937, "978-4", 34.0),
    ("A Hora da Estrela", 1977, "978-5", 27.0),
])

def mostrar(titulo, sql, params=()):
    print(f"\n-- {titulo}")
    print("   SQL:", " ".join(sql.split()))
    for linha in con.execute(sql, params):
        print("  ", linha)

mostrar("WHERE com comparação", "SELECT titulo, ano FROM livro WHERE ano < 1900")
mostrar("LIKE (curinga % e _)", "SELECT titulo FROM livro WHERE titulo LIKE 'M%' OR titulo LIKE '_idas%'")
mostrar("IN e BETWEEN", "SELECT titulo, preco FROM livro WHERE ano BETWEEN 1930 AND 1940 AND preco IN (24.5, 34.0)")
mostrar("ORDER BY e LIMIT/OFFSET (paginação)", "SELECT titulo, ano FROM livro ORDER BY ano DESC LIMIT 2 OFFSET 1")
mostrar("Agregação com GROUP BY e HAVING", """
    SELECT CASE WHEN ano < 1900 THEN 'século XIX' ELSE 'século XX' END AS epoca,
           COUNT(*) AS total, ROUND(AVG(preco), 2) AS preco_medio
    FROM livro GROUP BY epoca HAVING COUNT(*) > 1 ORDER BY total DESC""")
mostrar("NULL precisa de IS NULL, não de = NULL", "SELECT count(*) FROM livro WHERE isbn = NULL")
mostrar("...e isto funciona", "SELECT count(*) FROM livro WHERE isbn IS NULL")
mostrar("Subconsulta: livros mais caros que a média", """
    SELECT titulo, preco FROM livro
    WHERE preco > (SELECT AVG(preco) FROM livro) ORDER BY preco DESC""")
mostrar("Expressão CASE para classificar", """
    SELECT titulo, CASE WHEN preco >= 30 THEN 'caro' WHEN preco >= 25 THEN 'médio' ELSE 'barato' END AS faixa
    FROM livro ORDER BY preco""")

