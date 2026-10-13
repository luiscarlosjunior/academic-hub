"""Regressão não paramétrica: deixar os dados desenharem a curva.

Exemplo do dia a dia: consumo de energia de uma casa em função da temperatura
externa. O consumo é ALTO no frio (aquecedor) e no calor (ar-condicionado),
baixo nas temperaturas amenas: uma curva em U. Uma reta erra o padrão.
Além disso, alguns registros são falhas do medidor (outliers).

Métodos:
  - Theil-Sen: a inclinação é a MEDIANA das inclinações entre todos os pares
    (robusta a outliers, sem supor normalidade);
  - LOWESS: regressão local ponderada, que segue a curva sem forma fixa;
  - k-vizinhos (kNN): a previsão é a média dos k casos mais parecidos.
Usa numpy, scipy e statsmodels.   pip install numpy scipy statsmodels
"""
import numpy as np
from scipy import stats
from statsmodels.nonparametric.smoothers_lowess import lowess

rng = np.random.default_rng(11)

# ---------------------------------------------------------------------------
# 1) Dados: consumo (kWh/dia) em função da temperatura (°C), com 5 outliers
# ---------------------------------------------------------------------------
n = 150
temp = rng.uniform(-5, 38, size=n)
consumo = 6 + 0.035 * (temp - 20) ** 2 + rng.normal(0, 1.2, size=n)   # curva em U
idx_out = rng.choice(n, size=5, replace=False)
consumo[idx_out] += rng.choice([-12, 15], size=5)                    # falhas do medidor

# Separa treino e teste para avaliar a previsão em dados NOVOS
ordem = rng.permutation(n)
treino, teste = ordem[:120], ordem[120:]
xt, yt = temp[treino], consumo[treino]
xv, yv = temp[teste], consumo[teste]

# ---------------------------------------------------------------------------
# 2) Reta de mínimos quadrados (paramétrica) como referência
# ---------------------------------------------------------------------------
b_ols, a_ols = np.polyfit(xt, yt, 1)            # polyfit devolve [inclinação, intercepto]
print("Mínimos quadrados (reta):")
print(f"  inclinação = {b_ols:.4f}  intercepto = {a_ols:.3f}")
print()

# ---------------------------------------------------------------------------
# 3) Theil-Sen: a inclinação é a mediana das inclinações entre pares de pontos
# ---------------------------------------------------------------------------
b_ts, a_ts, _, _ = stats.theilslopes(yt, xt)
print("Theil-Sen (mediana das inclinações entre pares):")
print(f"  inclinação = {b_ts:.4f}  intercepto = {a_ts:.3f}")
print("  (resiste aos outliers, mas continua sendo uma reta: não resolve a curva em U)")
print()

# ---------------------------------------------------------------------------
# 4) LOWESS: suavização local. Cada previsão usa os pontos próximos, com peso decrescente
# ---------------------------------------------------------------------------
suave = lowess(yt, xt, frac=0.3, return_sorted=True)      # frac = fração de pontos por janela
def pred_lowess(x_novo):
    # interpolação linear sobre a curva suavizada (valores ordenados em x)
    return np.interp(x_novo, suave[:, 0], suave[:, 1])
print("LOWESS (suavização local), curva em U:")
for t in (-5, 10, 20, 30, 38):
    print(f"  {t:>3} °C -> consumo suavizado = {pred_lowess(t):6.2f} kWh/dia")
print()

# ---------------------------------------------------------------------------
# 5) kNN: média dos k vizinhos mais próximos em x
# ---------------------------------------------------------------------------
def pred_knn(x_novo, k=7):
    x_novo = np.atleast_1d(x_novo)
    out = []
    for x0 in x_novo:
        dist = np.abs(xt - x0)
        vizinhos = np.argsort(dist)[:k]
        out.append(yt[vizinhos].mean())
    return np.array(out)

# ---------------------------------------------------------------------------
# 6) Comparação no conjunto de TESTE (dados que nenhum modelo viu)
# ---------------------------------------------------------------------------
def erro(y_prev):
    return np.sqrt(np.mean((yv - y_prev) ** 2))

pred_ols = a_ols + b_ols * xv
pred_ts = a_ts + b_ts * xv
pred_lw = pred_lowess(xv)
pred_kn = pred_knn(xv, k=7)
print("Erro de previsão no conjunto de teste (RMSE, menor é melhor)")
print(f"  reta de mínimos quadrados: {erro(pred_ols):.3f}")
print(f"  Theil-Sen (linear robusto): {erro(a_ts + b_ts * xv):.3f}")
print(f"  LOWESS:                     {erro(pred_lw):.3f}")
print(f"  kNN (k = 7):                {erro(pred_kn):.3f}")
print()
print("A reta não captura a curva em U, e a versão robusta (Theil-Sen) também erra:")
print("robustez a outliers não corrige a FORMA errada. Os métodos locais (LOWESS, kNN) seguem a curva.")
print(f"A inclinação do OLS ({b_ols:.2f}) resume mal uma curva que desce e depois sobe.")
