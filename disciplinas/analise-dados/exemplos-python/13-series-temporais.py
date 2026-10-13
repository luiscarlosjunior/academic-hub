"""Séries temporais: tendência, sazonalidade, autocorrelação e previsão.

Exemplo do dia a dia: vendas mensais de agasalhos de uma loja, em 4 anos.
As vendas crescem (tendência), sobem no inverno, com pico em junho e julho
(sazonalidade), e têm ruído.
Mostra:
  - médias móveis para suavizar;
  - decomposição clássica em tendência + sazonal + resíduo;
  - autocorrelação (a venda de um mês depende do mês anterior?);
  - previsão com suavização exponencial de Holt-Winters.
Usa numpy, pandas e statsmodels.   pip install numpy pandas statsmodels
"""
import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import acf
from statsmodels.tsa.holtwinters import ExponentialSmoothing

rng = np.random.default_rng(13)

# ---------------------------------------------------------------------------
# 1) Série: 48 meses (2021 a 2024), vendas em milhares de unidades
# ---------------------------------------------------------------------------
meses = pd.date_range("2021-01-01", periods=48, freq="MS")
t = np.arange(48)
tendencia = 40 + 0.6 * t                                              # cresce ao longo do tempo
sazonal = 15 * np.sin(2 * np.pi * (t - 2) / 12)                       # pico em meados do ano (inverno)
ruido = rng.normal(0, 2.5, size=48)
vendas = pd.Series(np.round(tendencia + sazonal + ruido, 1), index=meses, name="vendas")

print("Primeiros meses (mil unidades):")
print(vendas.head(6).to_string())
print()

# ---------------------------------------------------------------------------
# 2) Média móvel de 12 meses: suaviza a sazonalidade e mostra a tendência
# ---------------------------------------------------------------------------
mm12 = vendas.rolling(window=12, center=True).mean()
print("Média móvel centrada de 12 meses (sem a sazonalidade):")
for data in ["2021-07-01", "2022-07-01", "2023-07-01"]:
    print(f"  {data[:7]}: {mm12.loc[data]:.2f}")
print()

# ---------------------------------------------------------------------------
# 3) Decomposição clássica: série = tendência + sazonal + resíduo (aditiva)
# ---------------------------------------------------------------------------
dec = seasonal_decompose(vendas, model="additive", period=12)
print("Decomposição: força do componente sazonal (amplitude máx − mín):")
print(f"  sazonal   = {dec.seasonal.max() - dec.seasonal.min():.2f}")
print(f"  resíduo   desvio padrão = {dec.resid.dropna().std():.2f}")
print("  índice sazonal por mês (média de cada mês do ano):")
indice = dec.seasonal[:12].round(2)
for m, v in zip(["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"], indice.values):
    print(f"    {m}: {v:+6.2f}")
print()

# ---------------------------------------------------------------------------
# 4) Autocorrelação: a série se parece com ela mesma defasada em k meses?
# ---------------------------------------------------------------------------
ac = acf(vendas - vendas.mean(), nlags=13)
print("Autocorrelação (ACF) por defasagem, em meses:")
for lag in (1, 2, 6, 12):
    print(f"  defasagem {lag:>2}: {ac[lag]:+.3f}")
print("  (defasagem 12 forte: o mesmo mês do ano anterior se parece)")
print()

# ---------------------------------------------------------------------------
# 5) Previsão de 6 meses com Holt-Winters (tendência + sazonalidade aditivas)
# ---------------------------------------------------------------------------
treino, real = vendas[:42], vendas[42:]
hw = ExponentialSmoothing(treino, trend="add", seasonal="add", seasonal_periods=12).fit()
previsao = hw.forecast(6)
erro = np.sqrt(np.mean((real.values - previsao.values) ** 2))
print("Holt-Winters: previsão para os últimos 6 meses (não vistos no treino)")
for data, real_v, prev_v in zip(real.index, real.values, previsao.values):
    print(f"  {data:%Y-%m}: real = {real_v:6.2f}   previsto = {prev_v:6.2f}")
print(f"  erro médio quadrático (RMSE) = {erro:.2f}")
