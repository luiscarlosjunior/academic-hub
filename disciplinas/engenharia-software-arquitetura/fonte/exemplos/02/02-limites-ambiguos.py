"""A palavra 'entre' é ambígua: a faixa 'entre R$ 50 e R$ 100' pode ser
inclusiva ou exclusiva nos extremos. Este programa aplica as duas leituras
aos mesmos preços e mostra exatamente onde elas divergem.
"""

precos = [49.99, 50.00, 75.00, 100.00, 100.01]

def faixa_inclusiva(p, lo, hi):
    return lo <= p <= hi

def faixa_exclusiva(p, lo, hi):
    return lo < p < hi

print(f"{'preço':>8}  {'inclusiva':>10}  {'exclusiva':>10}  divergem?")
for p in precos:
    a, b = faixa_inclusiva(p, 50, 100), faixa_exclusiva(p, 50, 100)
    print(f"{p:>8.2f}  {str(a):>10}  {str(b):>10}  {'SIM' if a != b else 'não'}")

divergentes = [p for p in precos if faixa_inclusiva(p, 50, 100) != faixa_exclusiva(p, 50, 100)]
print()
print("Casos que um teste de aceitação precisa fixar:", divergentes)
