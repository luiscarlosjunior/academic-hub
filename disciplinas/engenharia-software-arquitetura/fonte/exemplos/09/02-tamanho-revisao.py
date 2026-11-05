"""Tamanho do pull request e eficácia da revisão.

Dados fictícios de pull requests (linhas alteradas e número de comentários
relevantes da revisão). A literatura sobre revisão por pares (Cohen, 2006;
Sadowski et al., 2018) associa mudanças menores a revisões mais atentas.
O limite de 400 linhas é uma convenção de referência, não uma regra.
"""
from statistics import mean, median

prs = [
    ("PR-101", 45, 6), ("PR-102", 120, 5), ("PR-103", 260, 4),
    ("PR-104", 580, 2), ("PR-105", 1200, 1), ("PR-106", 80, 7),
    ("PR-107", 390, 3), ("PR-108", 950, 0),
]

LIMITE = 400
print(f"{'PR':<8}{'linhas':>8}{'comentários':>13}  situação")
for nome, linhas, com in prs:
    situacao = "dentro do limite" if linhas <= LIMITE else "acima: dividir"
    print(f"{nome:<8}{linhas:>8}{com:>13}  {situacao}")

pequenos = [c for _, l, c in prs if l <= LIMITE]
grandes = [c for _, l, c in prs if l > LIMITE]
print()
print(f"comentários médios em PRs até {LIMITE} linhas: {mean(pequenos):.1f}")
print(f"comentários médios em PRs acima de {LIMITE} linhas: {mean(grandes):.1f}")
print(f"mediana de linhas: {median(l for _, l, _ in prs):.0f}")
