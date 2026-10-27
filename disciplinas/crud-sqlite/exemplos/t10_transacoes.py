import sqlite3

con = sqlite3.connect(":memory:", isolation_level=None)   # controle manual de transações
con.execute("CREATE TABLE conta (id INTEGER PRIMARY KEY, titular TEXT, saldo INTEGER NOT NULL CHECK (saldo >= 0))")
con.executemany("INSERT INTO conta VALUES (?,?,?)", [(1, "Ana", 100), (2, "Bruno", 50)])

def saldos():
    return con.execute("SELECT titular, saldo FROM conta ORDER BY id").fetchall()

def transferir(origem, destino, valor):
    con.execute("BEGIN IMMEDIATE")          # bloqueia escrita: outros escritores esperam
    try:
        con.execute("UPDATE conta SET saldo = saldo - ? WHERE id = ?", (valor, origem))
        con.execute("UPDATE conta SET saldo = saldo + ? WHERE id = ?", (valor, destino))
        con.execute("COMMIT")               # tudo ou nada
        return "confirmada"
    except sqlite3.IntegrityError as e:
        con.execute("ROLLBACK")             # desfaz as duas alterações
        return "desfeita: " + str(e)

print("inicial:", saldos())
print("transferir 30 de Ana para Bruno:", transferir(1, 2, 30), saldos())
print("transferir 500 de Ana para Bruno:", transferir(1, 2, 500), saldos())

# Atomicidade mesmo com erro no meio: o débito feito antes é desfeito
con.execute("BEGIN")
con.execute("UPDATE conta SET saldo = saldo - 10 WHERE id = 1")
print("dentro da transação, saldo de Ana:", con.execute("SELECT saldo FROM conta WHERE id=1").fetchone()[0])
con.execute("ROLLBACK")
print("após ROLLBACK, saldo de Ana:", con.execute("SELECT saldo FROM conta WHERE id=1").fetchone()[0])

# SAVEPOINT: desfaz só uma parte da transação
con.execute("BEGIN")
con.execute("UPDATE conta SET saldo = saldo + 5 WHERE id = 2")
con.execute("SAVEPOINT ponto1")
con.execute("UPDATE conta SET saldo = saldo + 1000 WHERE id = 2")
con.execute("ROLLBACK TO ponto1")
con.execute("COMMIT")
print("com SAVEPOINT, saldo de Bruno:", con.execute("SELECT saldo FROM conta WHERE id=2").fetchone()[0])
