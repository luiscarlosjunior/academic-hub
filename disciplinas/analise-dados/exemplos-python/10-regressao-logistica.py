"""Regressão logística (paramétrica para desfechos binários).

Exemplo do dia a dia: um serviço de assinatura quer saber quem vai cancelar
(desfecho sim/não) a partir de:
  - meses de contrato;
  - número de chamados ao suporte no último trimestre.
A regressão linear não serve aqui: ela pode prever "probabilidades" menores
que zero ou maiores que um. A logística modela o LOGARITMO DAS CHANCES (logit).
Usa numpy e statsmodels.   pip install numpy statsmodels
"""
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(10)

# ---------------------------------------------------------------------------
# 1) Dados: 400 clientes; cancelar fica mais provável com poucos meses e muitos chamados
# ---------------------------------------------------------------------------
n = 400
meses = rng.uniform(1, 36, size=n)
chamados = rng.poisson(1.5, size=n).astype(float)
logit_verdadeiro = 1.2 - 0.09 * meses + 0.6 * chamados
prob_verdadeira = 1 / (1 + np.exp(-logit_verdadeiro))
cancelou = rng.binomial(1, prob_verdadeira)
print(f"Taxa de cancelamento na amostra: {cancelou.mean():.3f}")
print()

# ---------------------------------------------------------------------------
# 2) Ajuste: o modelo estima o LOGIT = log(p / (1 − p))
# ---------------------------------------------------------------------------
X = sm.add_constant(np.column_stack([meses, chamados]))
modelo = sm.Logit(cancelou, X).fit(disp=False)
print("Coeficientes no logit (escala do modelo)")
for nome, b, se, p in zip(["intercepto", "meses", "chamados"], modelo.params, modelo.bse, modelo.pvalues):
    print(f"  {nome:<11} b = {b:>7.3f}   EP = {se:.3f}   p = {p:.4f}")
print()

# ---------------------------------------------------------------------------
# 3) Odds ratio: exp(b) é o fator multiplicativo das CHANCES por unidade de x
# ---------------------------------------------------------------------------
print("Odds ratio = exp(b): quanto as chances multiplicam por +1 unidade de x")
print(f"  por mês de contrato: {np.exp(modelo.params[1]):.3f}   (cada mês reduz as chances em {1 - np.exp(modelo.params[1]):.1%})")
print(f"  por chamado:         {np.exp(modelo.params[2]):.3f}   (cada chamado aumenta as chances em {np.exp(modelo.params[2]) - 1:.1%})")
print()

# ---------------------------------------------------------------------------
# 4) Probabilidade prevista para dois clientes
# ---------------------------------------------------------------------------
perfis = np.array([[1, 3.0, 4.0],      # cliente novo (3 meses) com 4 chamados
                   [1, 30.0, 0.0]])    # cliente antigo (30 meses) sem chamados
probs = modelo.predict(perfis)
print("Probabilidade prevista de cancelar")
print(f"  3 meses, 4 chamados:  {probs[0]:.3f}")
print(f"  30 meses, 0 chamados: {probs[1]:.3f}")
print()

# ---------------------------------------------------------------------------
# 5) Classificação: transformar probabilidade em decisão (corte de 0,5)
# ---------------------------------------------------------------------------
p_hat = modelo.predict(X)
previsto = (p_hat >= 0.5).astype(int)
vp = np.sum((previsto == 1) & (cancelou == 1))
vn = np.sum((previsto == 0) & (cancelou == 0))
fp = np.sum((previsto == 1) & (cancelou == 0))
fn = np.sum((previsto == 0) & (cancelou == 1))
print("Matriz de confusão (corte 0,5)")
print(f"  verdadeiros positivos = {vp:>3}   falsos negativos = {fn:>3}")
print(f"  falsos positivos      = {fp:>3}   verdadeiros negativos = {vn:>3}")
print(f"  acurácia  = {(vp + vn) / n:.3f}")
print(f"  recall    = {vp / (vp + fn):.3f}   (dos que cancelaram, quantos o modelo pegou)")
print(f"  precisão  = {vp / (vp + fp):.3f}   (dos que o modelo marcou, quantos cancelaram)")
print()

# ---------------------------------------------------------------------------
# 6) Qualidade do ajuste: pseudo R² de McFadden
# ---------------------------------------------------------------------------
# McFadden (1979) classificou valores entre 0,2 e 0,4 como ajuste excelente
print(f"Pseudo R² de McFadden = {modelo.prsquared:.4f}  (entre 0,2 e 0,4 já é considerado excelente)")
