"""Distribuições de probabilidade e o Teorema Central do Limite.

Exemplos do dia a dia:
  - tempo de atendimento em um caixa (distribuição normal);
  - número de clientes que compram um produto em 20 visitas (binomial);
  - média de notas de turmas sorteadas (Teorema Central do Limite).
Usa numpy e scipy.   pip install numpy scipy
"""
import numpy as np
from scipy import stats

rng = np.random.default_rng(7)

# ---------------------------------------------------------------------------
# 1) Distribuição NORMAL: o tempo de atendimento médio é 4 min, desvio 1 min
# ---------------------------------------------------------------------------
mu, sigma = 4.0, 1.0
tempos = rng.normal(mu, sigma, size=5_000)
print("Normal: tempo de atendimento (min), mu=4, sigma=1")
print(f"  média amostral = {tempos.mean():.3f}   desvio = {tempos.std(ddof=1):.3f}")
for k in (1, 2, 3):
    # P(|X - mu| <= k·sigma), calculada pela distribuição teórica
    p = stats.norm.cdf(k) - stats.norm.cdf(-k)
    print(f"  P(dentro de {k} desvio(s)) = {p:.4f}")
print(f"  P(atender em menos de 3 min) = {stats.norm.cdf(3, mu, sigma):.4f}")
print()

# Escore z: quantos desvios um valor está da média
z = (5.5 - mu) / sigma
print(f"Escore z de 5,5 min = (5,5 - 4) / 1 = {z:.2f}")
print()

# ---------------------------------------------------------------------------
# 2) Histograma: como resumir a forma de uma distribuição com faixas
# ---------------------------------------------------------------------------
contagem, bordas = np.histogram(tempos, bins=8)
print("Histograma com 8 faixas (faixa, contagem):")
for i, c in enumerate(contagem):
    print(f"  [{bordas[i]:5.2f}, {bordas[i + 1]:5.2f})  {c:5d}  " + "#" * (c // 100))
print()

# ---------------------------------------------------------------------------
# 3) Distribuição BINOMIAL: sucessos em n tentativas independentes
# ---------------------------------------------------------------------------
# Um cliente compra com probabilidade 0,3 em cada visita. Em 20 visitas:
n, p = 20, 0.3
print(f"Binomial: compras em {n} visitas, p = {p}")
print(f"  esperado (n·p) = {n * p:.1f}   variância (n·p·(1-p)) = {n * p * (1 - p):.2f}")
print(f"  P(exatamente 6 compras)  = {stats.binom.pmf(6, n, p):.4f}")
print(f"  P(no máximo 3 compras)   = {stats.binom.cdf(3, n, p):.4f}")
print()

# ---------------------------------------------------------------------------
# 4) Teorema Central do Limite: a MÉDIA de muitas amostras tende a ser normal
# ---------------------------------------------------------------------------
# Tempo de espera individual segue uma distribuição EXPONENCIAL (muito assimétrica).
# Sorteamos 10 mil grupos de tamanho n e olhamos a distribuição das médias.
media_pop, desvio_pop = 4.0, 4.0          # na exponencial, média = desvio = 1/λ
print("Teorema Central do Limite (tempo de espera exponencial, média 4 min)")
print(f"  população: assimetria = {stats.skew(rng.exponential(media_pop, 100_000)):+.3f}  (cauda longa)")
for n_grupo in (2, 5, 30):
    medias = rng.exponential(media_pop, size=(10_000, n_grupo)).mean(axis=1)
    teorico = desvio_pop / np.sqrt(n_grupo)            # sigma / raiz(n)
    print(f"  n={n_grupo:>2}: média das médias = {medias.mean():.3f}   "
          f"desvio = {medias.std(ddof=1):.3f}  (teórico {teorico:.3f})   "
          f"assimetria = {stats.skew(medias):+.3f}")
print("  -> o desvio cai com a raiz de n e a assimetria encolhe até virar quase normal")
