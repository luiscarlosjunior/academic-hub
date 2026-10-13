"""Estatística básica: tipos de variável, amostragem e a Lei dos Grandes Números.

Dados fictícios de uma pesquisa com 12 estudantes de uma faculdade.
Usa apenas numpy e pandas.   pip install numpy pandas
"""
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# 1) Uma tabela de dados: cada LINHA é um indivíduo, cada COLUNA é uma variável
# ---------------------------------------------------------------------------
satisfacao = pd.Categorical(
    ["bom", "ótimo", "regular", "bom", "ótimo", "ruim", "bom", "regular",
     "ótimo", "bom", "regular", "bom"],
    categories=["ruim", "regular", "bom", "ótimo"], ordered=True,   # escala ordenada
)
dados = pd.DataFrame({
    "aluno": [f"A{i:02d}" for i in range(1, 13)],
    "curso": ["ADS", "ADS", "Eng", "Eng", "ADS", "Dir", "Eng", "Dir", "ADS", "Eng", "Dir", "ADS"],
    "idade": [19, 22, 20, 25, 18, 31, 21, 27, 19, 23, 24, 20],
    "horas_estudo": [10.0, 4.5, 12.0, 6.0, 9.5, 3.0, 8.0, 5.5, 11.0, 7.0, 6.0, 10.0],
    "satisfacao": satisfacao,
})

print("Primeiras linhas da tabela:")
print(dados.head())
print()

# Cada tipo de variável pede um tipo de resumo diferente
print("Tipo de cada variável (como o pandas a enxerga):")
print(dados.dtypes)
print()

# Qualitativa nominal: só categorias, sem ordem. Resumo = frequência.
freq = dados["curso"].value_counts()
print("Frequência absoluta do curso (nominal):")
print(freq)
print("\nFrequência relativa (%):")
print((dados["curso"].value_counts(normalize=True) * 100).round(1))
print()

# Qualitativa ordinal: categorias COM ordem. Dá para comparar (ótimo > bom).
print("Satisfação, em ordem crescente (ordinal):")
print(dados["satisfacao"].value_counts().sort_index())
print()

# Quantitativa: faz sentido média e desvio padrão.
print("Idade (quantitativa discreta, anos inteiros):", dados["idade"].dtype)
print("Horas de estudo (quantitativa contínua):", dados["horas_estudo"].dtype)
print()

# ---------------------------------------------------------------------------
# 2) Amostra × população: estimar algo grande olhando uma parte pequena
# ---------------------------------------------------------------------------
rng = np.random.default_rng(42)
populacao = rng.normal(loc=170, scale=10, size=10_000)   # alturas de 10 mil pessoas (cm)
media_verdadeira = populacao.mean()
print(f"Média da POPULAÇÃO (só o computador sabe, neste exemplo): {media_verdadeira:.2f} cm")
for n in (10, 100, 1000):
    amostra = rng.choice(populacao, size=n, replace=False)   # amostragem aleatória simples
    print(f"  amostra de n={n:>4}: média = {amostra.mean():.2f} cm   erro = {abs(amostra.mean() - media_verdadeira):.2f}")
print()

# ---------------------------------------------------------------------------
# 3) Lei dos Grandes Números: a frequência relativa converge para a probabilidade
# ---------------------------------------------------------------------------
lancamentos = rng.integers(0, 2, size=10_000)   # 0 = coroa, 1 = cara (moeda justa, p = 0,5)
acumulado = np.cumsum(lancamentos)
print("Moeda justa (P(cara) = 0,5): frequência de caras ao longo dos lançamentos")
for n in (10, 100, 1000, 10_000):
    print(f"  após {n:>6} lançamentos: {acumulado[n - 1] / n:.4f}")
print()

# Evento composto: soma de dois dados igual a 7.
# Probabilidade teórica = 6/36 = 0,1667 (6 combinações entre 36 possíveis).
dados_2 = rng.integers(1, 7, size=(100_000, 2))
p_soma_7 = np.mean(dados_2.sum(axis=1) == 7)
print(f"P(soma = 7) teórica = 6/36 = {6 / 36:.4f}")
print(f"P(soma = 7) simulada com 100 mil jogadas = {p_soma_7:.4f}")
