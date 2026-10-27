import sqlite3, os, tempfile

# Migrações versionadas com PRAGMA user_version: cada passo roda uma única vez.
MIGRACOES = [
    (1, "CREATE TABLE livro (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL)"),
    (2, "ALTER TABLE livro ADD COLUMN ano INTEGER"),
    (3, "CREATE INDEX idx_livro_titulo ON livro (titulo)"),
]

def migrar(con):
    versao = con.execute("PRAGMA user_version").fetchone()[0]
    for numero, sql in MIGRACOES:
        if numero > versao:
            with con:
                con.execute(sql)
                con.execute(f"PRAGMA user_version = {numero}")   # número vem do código, não do usuário
            print(f"  aplicada migração {numero}")
    return con.execute("PRAGMA user_version").fetchone()[0]

caminho = os.path.join(tempfile.mkdtemp(), "biblioteca.db")
con = sqlite3.connect(caminho)
# WAL: escritas vão para um arquivo de log separado, leitores não bloqueiam o escritor
print("modo de journal:", con.execute("PRAGMA journal_mode = WAL").fetchone()[0])
print("primeira execução:")
print("  versão final:", migrar(con))
con.close()

con = sqlite3.connect(caminho)
print("segunda execução (nada a fazer):")
print("  versão final:", migrar(con))

# Backup consistente com o banco em uso: VACUUM INTO gera uma cópia íntegra
destino = caminho + ".bak"
con.execute(f"VACUUM INTO '{destino}'")
copia = sqlite3.connect(destino)
print("backup íntegro:", copia.execute("PRAGMA integrity_check").fetchone()[0], "| versão:", copia.execute("PRAGMA user_version").fetchone()[0])

# Injeção de SQL: a versão vulnerável x a segura
con.execute("INSERT INTO livro (titulo) VALUES ('Dom Casmurro'), ('Vidas Secas')")
entrada = "' OR '1'='1"
vulneravel = f"SELECT titulo FROM livro WHERE titulo = '{entrada}'"
print("\nconsulta vulnerável devolve:", con.execute(vulneravel).fetchall())
print("consulta parametrizada devolve:", con.execute("SELECT titulo FROM livro WHERE titulo = ?", (entrada,)).fetchall())
