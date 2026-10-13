"""Estatística multivariada: reduzir dimensões (PCA) e agrupar casos (k-means).

Exemplo do dia a dia: perfil de 300 clientes de um supermercado online, com
5 medidas de comportamento: renda, idade, gasto com alimentos, gasto com
viagens e frequência de compras. Muitas variáveis se movem juntas. Queremos:
  1) resumir as 5 variáveis em 2 componentes principais (PCA);
  2) agrupar os clientes em perfis semelhantes (k-means).
Usa numpy e scikit-learn.   pip install numpy scikit-learn
"""
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(12)

# ---------------------------------------------------------------------------
# 1) Dados: três perfis escondidos (econômico, família e viajante) + ruído
# ---------------------------------------------------------------------------
perfis = rng.integers(0, 3, size=300)
renda = np.where(perfis == 0, 2.5, np.where(perfis == 1, 6.0, 11.0)) * 1000 + rng.normal(0, 600, 300)
idade = np.where(perfis == 1, 38, np.where(perfis == 0, 26, 52)) + rng.normal(0, 5, 300)
gasto_alim = np.where(perfis == 1, 900, 450) + rng.normal(0, 80, 300) + 0.05 * renda
gasto_viagem = np.where(perfis == 2, 2200, 150) + rng.normal(0, 200, 300)
freq_compras = np.where(perfis == 1, 9, 5) + rng.normal(0, 1.2, 300)

X = np.column_stack([renda, idade, gasto_alim, gasto_viagem, freq_compras])
nomes = ["renda", "idade", "gasto_alim", "gasto_viagem", "freq_compras"]
print(f"Matriz de dados: {X.shape[0]} clientes × {X.shape[1]} variáveis")
print()

# Padronizar: variáveis em escalas diferentes (reais × anos) precisam de média 0 e desvio 1
Z = StandardScaler().fit_transform(X)

# ---------------------------------------------------------------------------
# 2) PCA: autovetores da matriz de covariância (feito à mão, com álgebra linear)
# ---------------------------------------------------------------------------
cov = np.cov(Z, rowvar=False)
autovalores, autovetores = np.linalg.eigh(cov)
ordem = np.argsort(autovalores)[::-1]               # do maior para o menor
autovalores, autovetores = autovalores[ordem], autovetores[:, ordem]
variancia_explicada = autovalores / autovalores.sum()

print("PCA: variância explicada por componente")
for i, v in enumerate(variancia_explicada):
    print(f"  PC{i + 1}: {v:.1%}   acumulada: {variancia_explicada[: i + 1].sum():.1%}")
print()

print("Cargas (loadings) das 2 primeiras componentes")
for nome, c1, c2 in zip(nomes, autovetores[:, 0], autovetores[:, 1]):
    print(f"  {nome:<14} PC1 = {c1:+.3f}   PC2 = {c2:+.3f}")
print("  (PC1: quase todas as cargas têm o mesmo sinal, é um eixo geral de renda e gasto;")
print("   PC2 contrasta gasto com alimentos e compras frequentes com gasto em viagens)")
print()

componentes = Z @ autovetores[:, :2]               # projeção dos clientes nas 2 componentes
print(f"Projeção em 2D: {componentes.shape[0]} pontos, desvio de PC1 = {componentes[:, 0].std(ddof=1):.3f}")
print()

# ---------------------------------------------------------------------------
# 3) k-means: escolher k com o coeficiente de silhueta (quanto maior, mais separados)
# ---------------------------------------------------------------------------
print("k-means: silhueta para diferentes números de grupos (k)")
for k in (2, 3, 4, 5):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(componentes)
    s = silhouette_score(componentes, km.labels_)
    print(f"  k = {k}: silhueta = {s:.3f}   inércia = {km.inertia_:.1f}")
print()

km3 = KMeans(n_clusters=3, n_init=10, random_state=0).fit(componentes)
print("Tamanho de cada grupo com k = 3:", np.bincount(km3.labels_).tolist())
print()

# Perfil de cada grupo nas variáveis ORIGINAIS (valores médios, em unidades reais)
print("Perfil médio dos grupos (k = 3), nas variáveis originais")
print(f"  {'grupo':<6}{'renda':>10}{'idade':>8}{'alim':>9}{'viagem':>9}{'compras':>9}")
for g in range(3):
    m = X[km3.labels_ == g].mean(axis=0)
    print(f"  {g:<6}{m[0]:>10,.0f}{m[1]:>8.1f}{m[2]:>9,.0f}{m[3]:>9,.0f}{m[4]:>9.1f}")
