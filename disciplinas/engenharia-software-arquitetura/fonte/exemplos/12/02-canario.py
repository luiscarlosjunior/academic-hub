"""Implantação canário: expandir o tráfego somente enquanto o erro estiver baixo.

Simulação determinística: a versão nova tem taxa real de erro de 0,5%
(a antiga, 0,2%). Em cada etapa, observa-se uma amostra de requisições;
se a taxa observada ultrapassar o limite, a implantação é revertida.
"""
import random

random.seed(3)
ERRO_ANTIGO = 0.002
ERRO_NOVO = 0.005
LIMITE = 0.004            # limite de erro para continuar
ETAPAS = [1, 5, 25, 50, 100]   # % do tráfego
AMOSTRA = 4000

def observa(taxa, n):
    return sum(random.random() < taxa for _ in range(n)) / n

print(f"limite de erro para continuar: {LIMITE:.1%}")
for pct in ETAPAS:
    n = AMOSTRA * pct // 100 or 1
    taxa = observa(ERRO_NOVO, n)
    status = "continua" if taxa <= LIMITE else "REVERTE"
    print(f"  {pct:>3}% do tráfego ({n:>4} requisições): erro observado {taxa:.2%} -> {status}")
    if taxa > LIMITE:
        print("  implantação revertida; tráfego volta a 100% na versão antiga")
        break
else:
    print("  canário concluído: versão nova atende a 100% do tráfego")
