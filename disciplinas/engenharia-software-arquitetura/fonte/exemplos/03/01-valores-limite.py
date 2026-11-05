"""Partições de equivalência e análise de valores-limite com unittest.

Regra: compras a partir de R$ 100,00 (inclusive) ganham 5% de desconto.
Partições: abaixo do limite (sem desconto) e a partir do limite (com desconto).
Valores-limite: 99.99, 100.00 e 100.01.
"""
import unittest

def percentual_desconto(valor):
    return 5 if valor >= 100 else 0

class TesteDesconto(unittest.TestCase):
    def test_particao_sem_desconto(self):
        self.assertEqual(percentual_desconto(50), 0)

    def test_particao_com_desconto(self):
        self.assertEqual(percentual_desconto(250), 5)

    def test_limite_inferior_da_particao_com_desconto(self):
        self.assertEqual(percentual_desconto(100.00), 5)

    def test_imediatamente_abaixo_do_limite(self):
        self.assertEqual(percentual_desconto(99.99), 0)

    def test_imediatamente_acima_do_limite(self):
        self.assertEqual(percentual_desconto(100.01), 5)

if __name__ == "__main__":
    unittest.main(verbosity=2, exit=False)
