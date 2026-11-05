"""Modelo do Git na prática: branches, merge e o grafo de commits.

Cria um repositório temporário, faz commits em duas branches e integra
com merge. A saída mostra o grafo sem hashes (que mudam a cada execução).
Autor fictício usado apenas para o exemplo.
"""
import os
import subprocess
import tempfile

def git(*args, cwd):
    r = subprocess.run(["git", "-c", "user.name=Aluno Exemplo",
                        "-c", "user.email=aluno@example.com",
                        "-c", "init.defaultBranch=main", *args],
                       cwd=cwd, capture_output=True, text=True, check=True)
    return r.stdout

with tempfile.TemporaryDirectory() as d:
    git("init", "-q", cwd=d)
    with open(os.path.join(d, "catalogo.py"), "w") as f:
        f.write("def listar():\n    return []\n")
    git("add", ".", cwd=d)
    git("commit", "-q", "-m", "feat: listagem básica", cwd=d)

    git("switch", "-q", "-c", "feature/filtro-preco", cwd=d)
    with open(os.path.join(d, "catalogo.py"), "a") as f:
        f.write("\ndef filtrar_preco(p, lo, hi):\n    return [x for x in p if lo <= x <= hi]\n")
    git("commit", "-q", "-am", "feat: filtro por faixa de preço", cwd=d)

    git("switch", "-q", "main", cwd=d)
    with open(os.path.join(d, "README.md"), "w") as f:
        f.write("# Catálogo\n")
    git("add", ".", cwd=d)
    git("commit", "-q", "-m", "docs: README inicial", cwd=d)

    git("merge", "-q", "--no-edit", "feature/filtro-preco", cwd=d)

    print(git("log", "--graph", "--format=%s", "--all", cwd=d).rstrip())
    print()
    print("branches:", sorted(b.strip(" *") for b in git("branch", cwd=d).splitlines()))
    print("commits na main:", len(git("rev-list", "main", cwd=d).split()))
