"""Ponto flutuante: por que 0.1 + 0.2 não é 0.3, e como o decimal ajuda.

Também mostra a armadilha de criar Decimal a partir de float e a forma
correta, a partir de texto.
"""
from decimal import Decimal
from math import isclose

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(isclose(0.1 + 0.2, 0.3))
print(Decimal(0.1))
print(Decimal("0.1") + Decimal("0.2"))
print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
soma = sum([0.1] * 10)
print(soma, soma == 1.0)
