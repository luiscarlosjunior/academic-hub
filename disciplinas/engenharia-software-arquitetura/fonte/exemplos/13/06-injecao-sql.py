"""Injeção de SQL: a diferença entre concatenar e parametrizar.

A entrada 'x' OR '1'='1' é um texto comum digitado por um usuário. Montada
na consulta, ela altera a lógica e devolve todos os registros. Parametrizada,
é tratada como dado e não encontra nenhum nome.
"""
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE cliente(id INTEGER PRIMARY KEY, nome TEXT, cartao TEXT);
INSERT INTO cliente VALUES (1, 'Ana', '4111-0001'), (2, 'Bruno', '4111-0002');
""")

entrada = "x' OR '1'='1"
vulneravel = f"SELECT nome FROM cliente WHERE nome = '{entrada}'"
print("consulta montada:", vulneravel)
print("vulnerável devolve:", con.execute(vulneravel).fetchall())

seguro = "SELECT nome FROM cliente WHERE nome = ?"
print("parametrizada devolve:", con.execute(seguro, (entrada,)).fetchall())
