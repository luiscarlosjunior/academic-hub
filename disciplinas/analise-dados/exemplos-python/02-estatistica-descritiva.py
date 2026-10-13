"""Estatística descritiva: medidas de centro, de dispersão e de posição.

Exemplo do dia a dia: salários de 9 funcionários de uma pequena empresa.
Um salário muito alto (o da diretoria) distorce a média. Veja como cada
medida reage. Usa numpy, pandas e scipy.   pip install numpy pandas scipy
"""
import numpy as np
import pandas as pd
from scipy import stats

salarios = pd.Series(
    [2400, 2400, 2800, 3100, 3100, 3100, 3500, 4200, 19000],   # reais por mês
    name="salario",
)

# ---------------------------------------------------------------------------
# 1) Medidas de CENTRO: onde os dados se concentram
# ---------------------------------------------------------------------------
print("Medidas de centro")
print(f"  média     = {salarios.mean():>10,.2f}   (puxada pelo salário de 19 mil)")
print(f"  mediana   = {salarios.median():>10,.2f}   (o valor do meio, depois de ordenar)")
print(f"  moda      = {salarios.mode().tolist()}")
print()

# ---------------------------------------------------------------------------
# 2) Medidas de DISPERSÃO: quão espalhados estão os dados
# ---------------------------------------------------------------------------
# ddof=1 usa o divisor n-1 (estimador não viesado da variância amostral)
variancia = salarios.var(ddof=1)
desvio = salarios.std(ddof=1)
amplitude = salarios.max() - salarios.min()
print("Medidas de dispersão")
print(f"  amplitude = {amplitude:,}")
print(f"  variância = {variancia:,.2f}")
print(f"  desvio padrão = {desvio:,.2f}")
print(f"  coef. de variação = {desvio / salarios.mean():.2%}")
print()

# ---------------------------------------------------------------------------
# 3) Medidas de POSIÇÃO: quartis e o intervalo interquartil (IQR)
# ---------------------------------------------------------------------------
q1, q2, q3 = salarios.quantile([0.25, 0.5, 0.75])
iqr = q3 - q1
print("Quartis e IQR")
print(f"  Q1 = {q1:,.0f}   Q2 (mediana) = {q2:,.0f}   Q3 = {q3:,.0f}")
print(f"  IQR = Q3 - Q1 = {iqr:,.0f}")
# Regra de Tukey: valores fora de [Q1 - 1,5·IQR, Q3 + 1,5·IQR] são candidatos a outlier
limite_inf = q1 - 1.5 * iqr
limite_sup = q3 + 1.5 * iqr
outliers = salarios[(salarios < limite_inf) | (salarios > limite_sup)]
print(f"  cerca superior = {limite_sup:,.0f}  -> outliers: {outliers.tolist()}")
print()

# ---------------------------------------------------------------------------
# 4) Forma da distribuição: assimetria
# ---------------------------------------------------------------------------
print(f"Assimetria (skewness) = {stats.skew(salarios, bias=False):.3f}  (positiva: cauda à direita)")
print()

# ---------------------------------------------------------------------------
# 5) Resumo completo com uma linha
# ---------------------------------------------------------------------------
print("pandas.describe():")
print(salarios.describe().round(2).to_string())
print()

# O que muda se a diretoria sair do cálculo?
sem_diretoria = salarios[salarios < 10_000]
print(f"Sem o outlier: média = {sem_diretoria.mean():,.2f}, mediana = {sem_diretoria.median():,.2f}")
