"""Reamostragem e validação: bootstrap, teste de permutação e validação cruzada.

Exemplo do dia a dia: um app de entregas quer:
  1) um intervalo de confiança para o tempo mediano de entrega, sem supor normalidade
     (bootstrap);
  2) saber se um novo entregador é realmente mais rápido (teste de permutação);
  3) escolher o grau de um modelo que prevê o tempo a partir da distância, sem
     decorar o ruído (validação cruzada k-fold).
Usa numpy e scikit-learn.   pip install numpy scikit-learn
"""
import numpy as np
from sklearn.model_selection import KFold
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(14)

# ---------------------------------------------------------------------------
# 1) Bootstrap: reamostrar COM reposição para estimar a incerteza de qualquer estatística
# ---------------------------------------------------------------------------
# Tempo de entrega (min): assimétrico, com alguns atrasos grandes.
tempos = np.round(rng.lognormal(mean=3.2, sigma=0.35, size=60), 1)
mediana = np.median(tempos)

B = 5_000
reamostras = np.array([np.median(rng.choice(tempos, size=len(tempos), replace=True)) for _ in range(B)])
ic_inf, ic_sup = np.percentile(reamostras, [2.5, 97.5])
print("Bootstrap: intervalo de confiança de 95% para a MEDIANA do tempo de entrega")
print(f"  amostra: n = {len(tempos)}, mediana = {mediana:.2f} min")
print(f"  erro padrão bootstrap = {reamostras.std(ddof=1):.2f} min")
print(f"  IC percentil 95% = [{ic_inf:.2f} ; {ic_sup:.2f}] min")
print("  (não supôs normalidade: a mediana foi reamostrada diretamente)")
print()

# ---------------------------------------------------------------------------
# 2) Teste de permutação: se os grupos fossem iguais, rótulos trocados dariam o mesmo resultado?
# ---------------------------------------------------------------------------
novo = np.round(rng.lognormal(mean=3.05, sigma=0.35, size=40), 1)   # entregador novo
antigo = np.round(rng.lognormal(mean=3.20, sigma=0.35, size=40), 1)  # entregador antigo
dif_obs = np.median(antigo) - np.median(novo)

todos = np.concatenate([antigo, novo])
dif_perm = np.empty(5_000)
for i in range(5_000):
    emb = rng.permutation(todos)                                   # embaralha os rótulos
    dif_perm[i] = np.median(emb[:40]) - np.median(emb[40:])
p_perm = np.mean(np.abs(dif_perm) >= abs(dif_obs))
print("Teste de permutação (diferença de medianas, antigo − novo)")
print(f"  diferença observada = {dif_obs:.2f} min")
print(f"  p-valor por permutação = {p_perm:.4f}  (sem supor distribuição alguma)")
print()

# ---------------------------------------------------------------------------
# 3) Validação cruzada k-fold: escolher a complexidade pelo erro em dados NÃO vistos
# ---------------------------------------------------------------------------
distancia = rng.uniform(0.5, 12, size=80)                          # km
tempo_real = 8 + 2.2 * distancia - 0.08 * distancia ** 2 + rng.normal(0, 1.5, size=80)
X = distancia.reshape(-1, 1)
y = tempo_real

kf = KFold(n_splits=5, shuffle=True, random_state=0)
print("Validação cruzada (5 folds): erro médio quadrático por grau do polinômio")
print("  grau | RMSE treino | RMSE validação")
melhor = None
for grau in (1, 2, 3, 5, 9):
    rmse_tr, rmse_va = [], []
    for tr, va in kf.split(X):
        # padronizar as potências evita erro numérico em graus altos
        modelo = make_pipeline(PolynomialFeatures(grau), StandardScaler(), LinearRegression()).fit(X[tr], y[tr])
        rmse_tr.append(np.sqrt(np.mean((modelo.predict(X[tr]) - y[tr]) ** 2)))
        rmse_va.append(np.sqrt(np.mean((modelo.predict(X[va]) - y[va]) ** 2)))
    tr_m, va_m = np.mean(rmse_tr), np.mean(rmse_va)
    print(f"  {grau:>4} |   {tr_m:6.3f}    |    {va_m:6.3f}")
    if melhor is None or va_m < melhor[1]:
        melhor = (grau, va_m)
print(f"  grau escolhido pela validação: {melhor[0]}")
print()
print("Sobreajuste: com grau alto, o erro de treino cai um pouco, mas o de validação sobe.")
print("O modelo decora o ruído do treino; a validação cruzada revela isso.")
