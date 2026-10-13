"""Regressão linear múltipla (paramétrica): várias causas ao mesmo tempo.

Exemplo do dia a dia: aluguel de apartamentos com várias características:
  - área (m²), número de quartos, distância ao centro (km) e se o imóvel é
    novo (variável categórica, codificada em 0/1 com "dummy").
Mostra o efeito de controlar por outras variáveis, a multicolinearidade (VIF)
e o R² ajustado para comparar modelos com números diferentes de variáveis.
Usa numpy, pandas e statsmodels.   pip install numpy pandas statsmodels
"""
import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

rng = np.random.default_rng(9)

# ---------------------------------------------------------------------------
# 1) Dados: 120 imóveis
# ---------------------------------------------------------------------------
n = 120
area = rng.uniform(35, 150, size=n)
# quartos correlacionados com a área (apartamentos maiores têm mais quartos)
quartos = np.clip(np.round(area / 35 + rng.normal(0, 0.6, size=n)), 1, 5)
distancia = rng.uniform(0.5, 15, size=n)                  # km do centro
novo = rng.integers(0, 2, size=n)                         # 1 = imóvel novo (dummy)
aluguel = (250 + 17 * area + 120 * quartos - 45 * distancia + 350 * novo
           + rng.normal(0, 180, size=n))

df = pd.DataFrame({"aluguel": aluguel.round(0), "area": area.round(1), "quartos": quartos,
                   "distancia_km": distancia.round(1), "novo": novo})
print("Primeiras linhas:")
print(df.head().to_string(index=False))
print()

# ---------------------------------------------------------------------------
# 2) Modelo simples × múltiplo: o coeficiente de área muda com o controle?
# ---------------------------------------------------------------------------
m_simples = sm.OLS(df["aluguel"], sm.add_constant(df[["area"]])).fit()
X_mult = sm.add_constant(df[["area", "quartos", "distancia_km", "novo"]])
m_mult = sm.OLS(df["aluguel"], X_mult).fit()
print("Coeficiente de área:")
print(f"  só com área:           b = {m_simples.params['area']:.2f}   R² = {m_simples.rsquared:.4f}")
print(f"  controlando as demais: b = {m_mult.params['area']:.2f}   R² = {m_mult.rsquared:.4f}")
print("  (cada coeficiente é o efeito da variável mantendo as outras fixas)")
print()

# ---------------------------------------------------------------------------
# 3) Tabela completa do modelo múltiplo
# ---------------------------------------------------------------------------
print("Modelo múltiplo: coeficientes, erro padrão, t e p")
for nome in m_mult.params.index:
    print(f"  {nome:<12} b = {m_mult.params[nome]:>9.2f}   EP = {m_mult.bse[nome]:>7.2f}"
          f"   t = {m_mult.tvalues[nome]:>7.2f}   p = {m_mult.pvalues[nome]:.4f}")
print(f"  R² = {m_mult.rsquared:.4f}   R² ajustado = {m_mult.rsquared_adj:.4f}")
print()

# ---------------------------------------------------------------------------
# 4) Multicolinearidade: VIF > 5 (ou > 10) indica variáveis redundantes
# ---------------------------------------------------------------------------
print("VIF (fator de inflação da variância)")
for i, nome in enumerate(X_mult.columns):
    if nome == "const":
        continue
    vif = variance_inflation_factor(X_mult.values, i)
    print(f"  {nome:<12} VIF = {vif:.2f}")
print()

# ---------------------------------------------------------------------------
# 5) Previsão para um imóvel novo de 80 m², 2 quartos, 4 km do centro
# ---------------------------------------------------------------------------
novo_imovel = pd.DataFrame({"const": [1.0], "area": [80.0], "quartos": [2.0],
                            "distancia_km": [4.0], "novo": [1.0]})
prev = m_mult.get_prediction(novo_imovel).summary_frame(alpha=0.05)
print("Previsão para 80 m², 2 quartos, 4 km, imóvel novo")
print(f"  aluguel esperado = R$ {prev['mean'].iloc[0]:.2f}")
print(f"  IP 95%           = [R$ {prev['obs_ci_lower'].iloc[0]:.2f} ; R$ {prev['obs_ci_upper'].iloc[0]:.2f}]")
