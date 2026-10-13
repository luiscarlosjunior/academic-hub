"""Testes não paramétricos: Mann-Whitney, Wilcoxon, Kruskal-Wallis e qui-quadrado.

Não paramétricos NÃO supõem uma distribuição (normal) e trabalham com POSTOS
ou com contagens. Servem quando os dados são assimétricos, ordinais ou têm
outliers. Exemplos do dia a dia:
  - tempo de atendimento de dois caixas, com alguns casos muito longos;
  - satisfação (ruim a ótimo) antes e depois de uma mudança, no mesmo cliente;
  - três cidades com notas ordinais de satisfação;
  - preferência de produto (categoria) em dois bairros.
Usa numpy e scipy.   pip install numpy scipy
"""
import numpy as np
from scipy import stats

rng = np.random.default_rng(5)

# ---------------------------------------------------------------------------
# 1) Mann-Whitney U: duas amostras independentes, sem supor normalidade
# ---------------------------------------------------------------------------
# Tempo de atendimento (min): distribuição assimétrica, com cauda longa.
caixa_1 = np.round(rng.exponential(scale=4.0, size=40) + 1, 1)
caixa_2 = np.round(rng.exponential(scale=6.0, size=40) + 1, 1)

U, p_u = stats.mannwhitneyu(caixa_1, caixa_2, alternative="two-sided")
print("Mann-Whitney U (tempo de atendimento, caixas 1 e 2)")
print(f"  mediana caixa 1 = {np.median(caixa_1):.2f}   mediana caixa 2 = {np.median(caixa_2):.2f}")
print(f"  média caixa 1   = {caixa_1.mean():.2f}   média caixa 2   = {caixa_2.mean():.2f}")
print(f"  U = {U:.1f}   p-valor = {p_u:.4f}")
print()

# Comparação com o teste t: aqui os dois concordam, mas a média de cada caixa
# é puxada pela cauda longa. Com cauda mais extrema, o teste de postos é o mais estável.
t_stat, p_t = stats.ttest_ind(caixa_1, caixa_2, equal_var=False)
print(f"  (para comparação, Welch t: p = {p_t:.4f})")
print()

# ---------------------------------------------------------------------------
# 2) Wilcoxon: pareado, com diferenças que não são normais
# ---------------------------------------------------------------------------
satisf_antes = np.array([2, 3, 3, 1, 2, 4, 3, 2, 1, 3, 2, 2, 3, 1, 2, 3, 2, 4, 1, 2])   # 1 a 5
satisf_depois = np.array([3, 4, 3, 2, 3, 4, 4, 3, 2, 3, 3, 2, 4, 2, 3, 4, 3, 4, 2, 3])
W, p_w = stats.wilcoxon(satisf_depois, satisf_antes)
print("Wilcoxon (satisfação, mesmos 20 clientes, antes e depois)")
print(f"  mediana antes = {np.median(satisf_antes)}   mediana depois = {np.median(satisf_depois)}")
print(f"  W = {W:.1f}   p-valor = {p_w:.4f}")
print()

# ---------------------------------------------------------------------------
# 3) Kruskal-Wallis: três ou mais grupos independentes (equivalente não paramétrico da ANOVA)
# ---------------------------------------------------------------------------
cidade_a = rng.choice([1, 2, 3, 4, 5], size=50, p=[0.10, 0.20, 0.30, 0.25, 0.15])
cidade_b = rng.choice([1, 2, 3, 4, 5], size=50, p=[0.05, 0.15, 0.30, 0.30, 0.20])
cidade_c = rng.choice([1, 2, 3, 4, 5], size=50, p=[0.20, 0.30, 0.25, 0.15, 0.10])
H, p_kw = stats.kruskal(cidade_a, cidade_b, cidade_c)
print("Kruskal-Wallis (satisfação 1 a 5 em três cidades)")
print(f"  medianas: A = {np.median(cidade_a):.0f}, B = {np.median(cidade_b):.0f}, C = {np.median(cidade_c):.0f}")
print(f"  H = {H:.3f}   p-valor = {p_kw:.6f}")
print()

# ---------------------------------------------------------------------------
# 4) Qui-quadrado de independência: variáveis CATEGÓRICAS
# ---------------------------------------------------------------------------
#                   produto X  produto Y  produto Z
tabela = np.array([[38, 22, 15],    # bairro 1
                   [25, 30, 20],    # bairro 2
                   [12, 28, 35]])   # bairro 3
chi2, p_chi, gl, esperado = stats.chi2_contingency(tabela)
print("Qui-quadrado de independência (bairro × produto preferido)")
print("  frequências observadas:")
print(tabela)
print("  frequências esperadas sob independência (arredondadas):")
print(np.round(esperado, 1))
print(f"  chi² = {chi2:.3f}   gl = {gl}   p-valor = {p_chi:.6f}")
print()

# Força da associação: V de Cramér (0 = nenhuma, 1 = perfeita)
n_total = tabela.sum()
v_cramer = np.sqrt(chi2 / (n_total * (min(tabela.shape) - 1)))
print(f"  V de Cramér = {v_cramer:.3f}  (força da associação, entre 0 e 1)")
