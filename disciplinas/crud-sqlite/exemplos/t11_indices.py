import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE emprestimo (id INTEGER PRIMARY KEY, cliente_id INTEGER, data_saida TEXT, devolvido INTEGER)")
# 50 mil registros para o plano de execução fazer diferença
con.executemany("INSERT INTO emprestimo (cliente_id, data_saida, devolvido) VALUES (?, ?, ?)",
                ((i % 5000, f"2026-{(i % 12) + 1:02d}-01", i % 2) for i in range(50000)))
con.execute("ANALYZE")

consulta = "SELECT id FROM emprestimo WHERE cliente_id = 42"

print("ANTES do índice:")
for linha in con.execute("EXPLAIN QUERY PLAN " + consulta):
    print("  ", linha[-1])

con.execute("CREATE INDEX idx_emprestimo_cliente ON emprestimo (cliente_id)")
con.execute("ANALYZE")

print("DEPOIS do índice:")
for linha in con.execute("EXPLAIN QUERY PLAN " + consulta):
    print("  ", linha[-1])

print("\nresultado idêntico com e sem índice:", len(con.execute(consulta).fetchall()), "linhas")

# Índice composto: a ordem das colunas importa (prefixo esquerdo)
con.execute("CREATE INDEX idx_cli_data ON emprestimo (cliente_id, data_saida)")
print("\nPLANO com filtro no 1º campo do índice composto:")
for linha in con.execute("EXPLAIN QUERY PLAN SELECT id FROM emprestimo WHERE cliente_id = 42 AND data_saida > '2026-06-01'"):
    print("  ", linha[-1])
print("PLANO com filtro só no 2º campo (não usa o prefixo):")
for linha in con.execute("EXPLAIN QUERY PLAN SELECT id FROM emprestimo WHERE data_saida > '2026-06-01'"):
    print("  ", linha[-1])
