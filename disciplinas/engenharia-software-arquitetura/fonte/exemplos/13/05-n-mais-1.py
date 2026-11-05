"""Problema N+1 medido de verdade, com sqlite3 contando as consultas executadas.

Cria autores e livros em um banco em memória, e lista os autores com seus
livros de duas formas: uma consulta por autor (N+1) e uma consulta com junção.
O callback de rastreamento registra cada instrução executada pelo SQLite.
"""
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE autor(id INTEGER PRIMARY KEY, nome TEXT);
CREATE TABLE livro(id INTEGER PRIMARY KEY, autor_id INTEGER, titulo TEXT);
""")
con.executemany("INSERT INTO autor VALUES (?, ?)", [(i, f"autor{i}") for i in range(1, 51)])
con.executemany("INSERT INTO livro VALUES (?, ?, ?)",
                [(i, (i % 50) + 1, f"livro{i}") for i in range(1, 151)])

contador = {"n": 0}
con.set_trace_callback(lambda sql: contador.__setitem__("n", contador["n"] + 1))

contador["n"] = 0
autores = con.execute("SELECT id, nome FROM autor").fetchall()
for aid, _ in autores:
    con.execute("SELECT titulo FROM livro WHERE autor_id = ?", (aid,)).fetchall()
print("N+1 (uma consulta por autor):", contador["n"], "consultas para", len(autores), "autores")

contador["n"] = 0
con.execute("""SELECT a.nome, l.titulo FROM autor a
               LEFT JOIN livro l ON l.autor_id = a.id""").fetchall()
print("junção única:", contador["n"], "consulta(s)")
