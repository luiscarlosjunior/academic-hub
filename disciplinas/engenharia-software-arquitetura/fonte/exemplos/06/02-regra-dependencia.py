"""Verificação automática da regra de dependência com o módulo ast.

Regra: o pacote 'dominio' não pode importar 'infra' nem 'web'.
As fontes abaixo são exemplos fictícios; o verificador lê os imports sem
executar nenhum módulo. Também detecta ciclos no grafo de dependências.
"""
import ast

FONTES = {
    "dominio.pedidos": "import dominio.regras\nclass P: pass\n",
    "dominio.regras":  "from infra.sql import Conexao\ndef desconto(v): return v\n",
    "infra.sql":       "import dominio.pedidos\nclass Conexao: pass\n",
    "web.rotas":       "from dominio.pedidos import P\n",
}

def importacoes(fonte):
    arvore = ast.parse(fonte)
    nomes = []
    for no in ast.walk(arvore):
        if isinstance(no, ast.Import):
            nomes += [a.name for a in no.names]
        elif isinstance(no, ast.ImportFrom) and no.module:
            nomes.append(no.module)
    return nomes

grafo = {m: importacoes(f) for m, f in FONTES.items()}
print("Grafo de dependências:")
for m, deps in grafo.items():
    print(f"  {m} -> {deps}")

print("\nViolações da regra (dominio -> infra|web):")
viol = [(m, d) for m, deps in grafo.items() if m.startswith("dominio")
        for d in deps if d.split(".")[0] in ("infra", "web")]
for m, d in viol:
    print(f"  {m} importa {d}")
print("  total:", len(viol))

def tem_ciclo(grafo):
    visitados, pilha = set(), set()
    def dfs(n, caminho):
        if n in pilha:
            return caminho[caminho.index(n):] + [n]
        if n in visitados:
            return None
        visitados.add(n); pilha.add(n)
        for d in grafo.get(n, []):
            if d in grafo:
                c = dfs(d, caminho + [n])
                if c:
                    return c
        pilha.discard(n)
        return None
    for n in grafo:
        c = dfs(n, [])
        if c:
            return c
    return None

ciclo = tem_ciclo(grafo)
print("\nCiclo encontrado:", " -> ".join(ciclo) if ciclo else "nenhum")
