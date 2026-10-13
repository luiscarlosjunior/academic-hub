"""Regressão linear simples (paramétrica): prever uma variável a partir de uma outra.

Exemplo do dia a dia: aluguel de apartamentos (R$/mês) em função da área (m²).
Mostra a fórmula de mínimos quadrados à mão, a tabela completa do statsmodels,
a leitura do R² e a previsão com intervalo.
Usa numpy e statsmodels.   pip install numpy statsmodels
"""
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(8)

# ---------------------------------------------------------------------------
# 1) Dados: 40 apartamentos (área em m² e aluguel em R$)
# ---------------------------------------------------------------------------
area = rng.uniform(35, 120, size=40).round(0)
aluguel = (300 + 18.5 * area + rng.normal(0, 150, size=40)).round(0)

# ---------------------------------------------------------------------------
# 2) Mínimos quadrados à mão: b = Sxy / Sxx  e  a = média(y) − b · média(x)
# ---------------------------------------------------------------------------
x_bar, y_bar = area.mean(), aluguel.mean()
Sxy = np.sum((area - x_bar) * (aluguel - y_bar))
Sxx = np.sum((area - x_bar) ** 2)
b = Sxy / Sxx
a = y_bar - b * x_bar
print("Mínimos quadrados à mão")
print(f"  reta: aluguel = {a:.2f} + {b:.2f} · área")
print()

# ---------------------------------------------------------------------------
# 3) Tabela completa (statsmodels OLS): coeficientes, erro padrão, t, p e R²
# ---------------------------------------------------------------------------
X = sm.add_constant(area)                # coluna de 1 para o intercepto
modelo = sm.OLS(aluguel, X).fit()
print("Coeficientes (statsmodels)")
print(f"  intercepto = {modelo.params[0]:.2f}   erro padrão = {modelo.bse[0]:.2f}   p = {modelo.pvalues[0]:.4f}")
print(f"  inclinação = {modelo.params[1]:.2f}   erro padrão = {modelo.bse[1]:.2f}   p = {modelo.pvalues[1]:.2e}")
print()

# ---------------------------------------------------------------------------
# 4) Qualidade do ajuste: R² e erro padrão residual
# ---------------------------------------------------------------------------
residuos = modelo.resid
print("Qualidade do ajuste")
print(f"  R² = {modelo.rsquared:.4f}  (fração da variação do aluguel explicada pela área)")
print(f"  erro padrão residual = R$ {np.sqrt(np.sum(residuos ** 2) / (len(aluguel) - 2)):.2f}")
print()

# ---------------------------------------------------------------------------
# 5) Previsão para um apartamento de 70 m²: intervalo de confiança e de previsão
# ---------------------------------------------------------------------------
novo = sm.add_constant(np.array([70.0]), has_constant="add")
prev = modelo.get_prediction(novo).summary_frame(alpha=0.05)
print("Previsão para 70 m²")
print(f"  aluguel esperado (média) = R$ {prev['mean'].iloc[0]:.2f}")
print(f"  IC 95% da média:     [{prev['mean_ci_lower'].iloc[0]:.2f} ; {prev['mean_ci_upper'].iloc[0]:.2f}]")
print(f"  IP 95% de um imóvel: [{prev['obs_ci_lower'].iloc[0]:.2f} ; {prev['obs_ci_upper'].iloc[0]:.2f}]")
print()

# ---------------------------------------------------------------------------
# 6) Diagnóstico: os resíduos devem ser aleatórios em torno de zero
# ---------------------------------------------------------------------------
print("Diagnóstico dos resíduos")
print(f"  média dos resíduos = {residuos.mean():.2e}  (zero por construção)")
print(f"  correlação resíduo × área = {np.corrcoef(residuos, area)[0, 1]:.2e}  (zero por construção)")
