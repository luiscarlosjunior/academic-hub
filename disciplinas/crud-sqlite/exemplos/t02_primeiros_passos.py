import sqlite3

# Abrir (ou criar) um banco: em memória, para o exemplo não deixar arquivos.
con = sqlite3.connect(":memory:")
print("versão do SQLite:", sqlite3.sqlite_version)

con.executescript(open("biblioteca_schema.sql", encoding="utf-8").read())

# O catálogo do banco fica numa tabela de sistema: sqlite_master
print("\nTabelas criadas:")
for (nome,) in con.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"):
    print(" -", nome)

# Estrutura de uma tabela (equivale ao comando .schema no terminal)
print("\nColunas de livro:")
for cid, nome, tipo, notnull, padrao, pk in con.execute("PRAGMA table_info(livro)"):
    print(f"  {nome:<8} {tipo:<8} NOT NULL={bool(notnull)!s:<5} PK={bool(pk)}")
con.close()
