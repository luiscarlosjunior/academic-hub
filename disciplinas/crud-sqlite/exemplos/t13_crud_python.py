"""CRUD completo de livros com uma camada de repositório, validação e testes."""
import sqlite3
from dataclasses import dataclass

@dataclass
class Livro:
    titulo: str
    ano: int
    preco: float = 0.0
    isbn: str | None = None
    id: int | None = None

class LivroRepositorio:
    def __init__(self, caminho: str = ":memory:"):
        self.con = sqlite3.connect(caminho)
        self.con.execute("PRAGMA foreign_keys = ON")
        self.con.execute("""CREATE TABLE IF NOT EXISTS livro (
                              id INTEGER PRIMARY KEY,
                              titulo TEXT NOT NULL,
                              ano INTEGER NOT NULL CHECK (ano > 0),
                              preco REAL NOT NULL DEFAULT 0 CHECK (preco >= 0),
                              isbn TEXT UNIQUE)""")

    # C: create
    def criar(self, livro: Livro) -> Livro:
        livro.titulo = livro.titulo.strip()          # normaliza ANTES de gravar
        if not livro.titulo:
            raise ValueError("título é obrigatório")
        with self.con:  # commit automático, ou rollback se houver exceção
            cur = self.con.execute(
                "INSERT INTO livro (titulo, ano, preco, isbn) VALUES (?, ?, ?, ?)",
                (livro.titulo, livro.ano, livro.preco, livro.isbn))
        livro.id = cur.lastrowid
        return livro

    # R: read (um e vários)
    def buscar(self, id: int) -> Livro | None:
        linha = self.con.execute("SELECT id, titulo, ano, preco, isbn FROM livro WHERE id = ?", (id,)).fetchone()
        return Livro(*linha[1:], id=linha[0]) if linha else None

    def listar(self, ano_minimo: int = 0) -> list[Livro]:
        linhas = self.con.execute(
            "SELECT id, titulo, ano, preco, isbn FROM livro WHERE ano >= ? ORDER BY titulo", (ano_minimo,))
        return [Livro(t, a, p, i, id=k) for k, t, a, p, i in linhas]

    # U: update (retorna se alterou)
    def atualizar(self, livro: Livro) -> bool:
        with self.con:
            cur = self.con.execute(
                "UPDATE livro SET titulo = ?, ano = ?, preco = ?, isbn = ? WHERE id = ?",
                (livro.titulo, livro.ano, livro.preco, livro.isbn, livro.id))
        return cur.rowcount == 1

    # D: delete
    def remover(self, id: int) -> bool:
        with self.con:
            cur = self.con.execute("DELETE FROM livro WHERE id = ?", (id,))
        return cur.rowcount == 1

# ---------- Testes: cada operação verificada ----------
def testar():
    repo = LivroRepositorio()
    a = repo.criar(Livro("  Dom Casmurro ", 1899, 29.9, "978-1"))
    b = repo.criar(Livro("Vidas Secas", 1938, 24.5, "978-3"))
    assert a.id == 1 and a.titulo == "Dom Casmurro", "create com trim"
    print("create ok:", a)

    assert repo.buscar(b.id).titulo == "Vidas Secas"
    assert repo.buscar(999) is None
    print("read ok:", [l.titulo for l in repo.listar()])
    print("read com filtro ano >= 1930:", [l.titulo for l in repo.listar(1930)])

    b.preco = 19.9
    assert repo.atualizar(b) and repo.buscar(b.id).preco == 19.9
    print("update ok: preço de", b.titulo, "agora", repo.buscar(b.id).preco)

    assert repo.remover(a.id) and repo.buscar(a.id) is None
    assert not repo.remover(a.id)
    print("delete ok: restam", len(repo.listar()), "livro(s)")

    # Validação na aplicação (ValueError) e no banco (IntegrityError)
    for descricao, livro in [("título vazio", Livro("   ", 2000)),
                             ("preço negativo", Livro("X", 2000, -1.0))]:
        try:
            repo.criar(livro)
        except (ValueError, sqlite3.IntegrityError) as e:
            print(f"recusado ({descricao}):", type(e).__name__, "-", e)
    try:
        repo.criar(Livro("Duplicado", 2001, isbn="978-3"))
    except sqlite3.IntegrityError as e:
        print("unicidade recusou isbn repetido:", e)

if __name__ == "__main__":
    testar()
    print("\nTodos os testes passaram.")
