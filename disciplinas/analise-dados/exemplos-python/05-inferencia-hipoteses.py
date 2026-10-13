"""Inferência estatística: intervalo de confiança, teste de hipótese, erros e poder.

Exemplo do dia a dia: uma cafeteria lançou uma nova receita e quer saber se a
nota média dos clientes mudou em relação ao padrão de 7,0.
Usa numpy e scipy.   pip install numpy scipy
"""
import numpy as np
from scipy import stats

rng = np.random.default_rng(11)

# ---------------------------------------------------------------------------
# 1) Amostra: notas de 25 clientes que provaram a nova receita
# ---------------------------------------------------------------------------
notas = np.round(rng.normal(loc=7.6, scale=1.2, size=25).clip(0, 10), 1)
n = len(notas)
media = notas.mean()
dp = notas.std(ddof=1)
print(f"Amostra: n = {n}, média = {media:.3f}, desvio padrão = {dp:.3f}")
print()

# ---------------------------------------------------------------------------
# 2) Intervalo de confiança de 95% para a média (distribuição t de Student)
# ---------------------------------------------------------------------------
erro_padrao = dp / np.sqrt(n)                       # s / raiz(n)
t_crit = stats.t.ppf(0.975, df=n - 1)               # quantil bicaudal de 95%
ic_inf, ic_sup = media - t_crit * erro_padrao, media + t_crit * erro_padrao
print("Intervalo de confiança de 95% para a média real:")
print(f"  [{ic_inf:.3f} ; {ic_sup:.3f}]")
print(f"  (se repetíssemos o experimento muitas vezes, ~95% dos intervalos conteriam a média real)")
print()

# ---------------------------------------------------------------------------
# 3) Teste de hipótese: H0: média = 7,0   x   H1: média ≠ 7,0
# ---------------------------------------------------------------------------
t_obs, p_valor = stats.ttest_1samp(notas, popmean=7.0)
print("Teste t de uma amostra (H0: média = 7,0)")
print(f"  estatística t = {t_obs:.3f}")
print(f"  p-valor (bicaudal) = {p_valor:.4f}")
alpha = 0.05
decisao = "rejeita H0" if p_valor < alpha else "não rejeita H0"
print(f"  com alpha = {alpha}: {decisao}")
print()

# ---------------------------------------------------------------------------
# 4) Erro tipo I: quantas vezes o teste rejeita H0 quando H0 é VERDADEIRA?
# ---------------------------------------------------------------------------
# Simulamos 10 mil experimentos com média real = 7,0 (H0 verdadeira).
rejeicoes = 0
for _ in range(10_000):
    amostra = rng.normal(7.0, 1.2, size=25)
    if stats.ttest_1samp(amostra, popmean=7.0).pvalue < alpha:
        rejeicoes += 1
print("Erro tipo I (falso positivo), com H0 verdadeira:")
print(f"  taxa de rejeição = {rejeicoes / 10_000:.4f}   (esperado: alpha = {alpha})")
print()

# ---------------------------------------------------------------------------
# 5) Poder: a chance de detectar uma diferença REAL (média real = 7,5)
# ---------------------------------------------------------------------------
for tamanho in (10, 25, 100):
    detectados = 0
    for _ in range(4_000):
        amostra = rng.normal(7.5, 1.2, size=tamanho)
        if stats.ttest_1samp(amostra, popmean=7.0).pvalue < alpha:
            detectados += 1
    print(f"Poder com n = {tamanho:>3} (diferença real de 0,5): {detectados / 4_000:.3f}")
print()

# ---------------------------------------------------------------------------
# 6) p-valor não é a probabilidade de H0 ser verdadeira
# ---------------------------------------------------------------------------
print("O p-valor é P(dados tão extremos ou mais | H0 verdadeira), não P(H0 | dados).")
