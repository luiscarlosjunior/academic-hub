"""Testes paramétricos: t de Student (amostras independentes e pareadas) e ANOVA.

Testes paramétricos supõem uma forma para a distribuição (em geral normal) e
comparam MÉDIAS. Exemplos do dia a dia:
  - duas lojas: a média de vendas diárias diferente?
  - mesma academia, antes e depois de 8 semanas de treino (pareado);
  - três métodos de ensino comparados numa mesma prova (ANOVA).
Usa numpy e scipy.   pip install numpy scipy
"""
import numpy as np
from scipy import stats

rng = np.random.default_rng(21)

# ---------------------------------------------------------------------------
# 0) Pressupostos: antes de confiar no teste, verifique normalidade e variâncias
# ---------------------------------------------------------------------------
loja_a = np.round(rng.normal(520, 60, size=30), 1)   # vendas diárias (R$ mil)
loja_b = np.round(rng.normal(565, 75, size=30), 1)

print("Pressupostos")
print(f"  Shapiro-Wilk loja A: p = {stats.shapiro(loja_a).pvalue:.3f}  (p > 0,05: sem evidência contra a normalidade)")
print(f"  Shapiro-Wilk loja B: p = {stats.shapiro(loja_b).pvalue:.3f}")
print(f"  Levene (variâncias iguais?): p = {stats.levene(loja_a, loja_b).pvalue:.3f}")
print()

# ---------------------------------------------------------------------------
# 1) t de Student para DUAS amostras independentes
# ---------------------------------------------------------------------------
# equal_var=False usa o teste de Welch: não exige variâncias iguais (padrão seguro).
t, p = stats.ttest_ind(loja_a, loja_b, equal_var=False)
print("Teste t de Welch (duas lojas, amostras independentes)")
print(f"  média A = {loja_a.mean():.2f}   média B = {loja_b.mean():.2f}")
print(f"  diferença = {loja_b.mean() - loja_a.mean():.2f}")
print(f"  t = {t:.3f}   p-valor = {p:.4f}")
print()

# ---------------------------------------------------------------------------
# 2) t PAREADO: as mesmas pessoas medidas duas vezes
# ---------------------------------------------------------------------------
antes = np.round(rng.normal(72, 8, size=20), 1)           # peso (kg)
depois = antes - np.round(rng.normal(2.5, 1.5, size=20), 1)
t_p, p_p = stats.ttest_rel(depois, antes)
print("Teste t pareado (mesmos 20 alunos, antes e depois)")
print(f"  redução média = {(antes - depois).mean():.2f} kg")
print(f"  t = {t_p:.3f}   p-valor = {p_p:.6f}")
print()
# Por que pareado? Porque cada pessoa é o seu próprio controle: a variação entre pessoas some.
t_errado, p_errado = stats.ttest_ind(depois, antes, equal_var=False)
print(f"  (se ignorássemos o pareamento: p = {p_errado:.4f} — a força do teste cai)")
print()

# ---------------------------------------------------------------------------
# 3) ANOVA de um fator: três métodos de ensino, mesma prova
# ---------------------------------------------------------------------------
metodo_a = np.round(rng.normal(6.8, 1.0, size=25), 1)
metodo_b = np.round(rng.normal(7.1, 1.0, size=25), 1)
metodo_c = np.round(rng.normal(7.9, 1.0, size=25), 1)
F, p_f = stats.f_oneway(metodo_a, metodo_b, metodo_c)
print("ANOVA de um fator (três métodos de ensino)")
print(f"  médias: A = {metodo_a.mean():.2f}, B = {metodo_b.mean():.2f}, C = {metodo_c.mean():.2f}")
print(f"  F = {F:.3f}   p-valor = {p_f:.6f}")
print("  ANOVA diz SE há diferença entre grupos, não ONDE. Para isso: testes post hoc.")
print()

# Tamanho do efeito: quanto da variação das notas é explicado pelo método?
todos = np.concatenate([metodo_a, metodo_b, metodo_c])
grande_media = todos.mean()
ss_entre = sum(len(g) * (g.mean() - grande_media) ** 2 for g in (metodo_a, metodo_b, metodo_c))
ss_total = ((todos - grande_media) ** 2).sum()
print(f"  eta² = SQ_entre / SQ_total = {ss_entre / ss_total:.3f}  (fração da variação explicada)")
