"""Correlação: Pearson, Spearman e o cuidado com causalidade.

Exemplos do dia a dia:
  - horas de estudo × nota (relação linear);
  - um único aluno muito atípico que distorce o Pearson;
  - vendas de sorvete × afogamentos: correlação forte com uma causa oculta
    (o calor).
Usa numpy e scipy.   pip install numpy scipy
"""
import numpy as np
from scipy import stats

rng = np.random.default_rng(3)

# ---------------------------------------------------------------------------
# 1) Pearson: relação LINEAR entre duas variáveis quantitativas
# ---------------------------------------------------------------------------
horas = np.array([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], dtype=float)
nota = np.array([4.8, 5.2, 5.9, 6.1, 6.8, 7.0, 7.6, 7.9, 8.4, 8.6])

r, p = stats.pearsonr(horas, nota)
print("Pearson: horas de estudo × nota")
print(f"  r = {r:.4f}   p-valor = {p:.2e}")
print(f"  r² = {r ** 2:.4f}  (fração da variação da nota explicada pelas horas, numa reta)")
print()

# ---------------------------------------------------------------------------
# 2) Um outlier muda tudo: Pearson é sensível a valores extremos
# ---------------------------------------------------------------------------
# Um aluno que estudou 0 hora e tirou 10: ele sozinho mexe na correlação.
# Spearman resiste melhor a valores grandes, mas não é imune a inversões de ordem.
horas_out = np.append(horas, 0.0)
nota_out = np.append(nota, 10.0)
r_out, _ = stats.pearsonr(horas_out, nota_out)
rs_out, _ = stats.spearmanr(horas_out, nota_out)
print("Com um outlier (0 hora, nota 10):")
print(f"  Pearson  r = {r_out:.4f}  (caiu bastante)")
print(f"  Spearman ρ = {rs_out:.4f}  (também cai: o ponto inverte a ordem dos postos)")
print()

# ---------------------------------------------------------------------------
# 3) Spearman: relação MONOTÔNICA (sempre crescente, não necessariamente reta)
# ---------------------------------------------------------------------------
x = np.linspace(1, 10, 40)
y = np.exp(x / 3)                       # cresce sempre, mas de forma curva
print("Relação monotônica não linear (y = e^(x/3)):")
print(f"  Pearson  r = {stats.pearsonr(x, y)[0]:.4f}")
print(f"  Spearman ρ = {stats.spearmanr(x, y)[0]:.4f}  (perfeito: a ordem nunca muda)")
print()

# ---------------------------------------------------------------------------
# 4) Correlação espúria: uma causa oculta (temperatura) gera correlação
# ---------------------------------------------------------------------------
temperatura = rng.uniform(15, 40, size=200)                      # causa comum
sorvete = 20 + 3.0 * temperatura + rng.normal(0, 8, size=200)    # vendas
afogamentos = 1 + 0.12 * temperatura + rng.normal(0, 1.0, size=200)

r_direta, _ = stats.pearsonr(sorvete, afogamentos)
r_parcial_temp, _ = stats.pearsonr(sorvete - np.polyval(np.polyfit(temperatura, sorvete, 1), temperatura),
                                   afogamentos - np.polyval(np.polyfit(temperatura, afogamentos, 1), temperatura))
print("Sorvete × afogamentos (nenhum causa o outro):")
print(f"  correlação direta r = {r_direta:.4f}")
print(f"  correlação após remover o efeito da temperatura = {r_parcial_temp:+.4f}")
print()

# ---------------------------------------------------------------------------
# 5) Teste de significância: correlação pode ser "forte" por acaso em n pequeno
# ---------------------------------------------------------------------------
for n in (5, 30, 300):
    a = rng.normal(size=n)
    b = rng.normal(size=n)                  # independentes: correlação real = 0
    r_n, p_n = stats.pearsonr(a, b)
    print(f"  n={n:>3}: r = {r_n:+.3f}  p = {p_n:.3f}   (dados independentes)")
