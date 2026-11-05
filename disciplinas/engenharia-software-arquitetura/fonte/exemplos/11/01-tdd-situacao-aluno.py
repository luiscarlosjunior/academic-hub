"""TDD: regra de situação de um aluno, com a implementação final.

Ciclo registrado em commits (vermelho, verde, refatorar) da seguinte forma:
1) testes de média ponderada; 2) regra de situação com valores-limite.
A função media_ponderada é implementada primeiro (verde mínimo); a regra
de situação só depois de um teste falhar para ela. Aqui está o estado final.
"""
import unittest

NOTA_APROVACAO = 7.0
NOTA_RECUPERACAO = 4.0

def media_ponderada(notas_e_pesos):
    soma_pesos = sum(peso for _, peso in notas_e_pesos)
    if soma_pesos == 0:
        raise ValueError("a soma dos pesos deve ser maior que zero")
    return sum(nota * peso for nota, peso in notas_e_pesos) / soma_pesos

def situacao(media):
    if media >= NOTA_APROVACAO:
        return "aprovado"
    if media >= NOTA_RECUPERACAO:
        return "recuperação"
    return "reprovado"

class TesteMediaPonderada(unittest.TestCase):
    def test_considera_os_pesos(self):
        self.assertAlmostEqual(media_ponderada([(8, 2), (4, 1)]), 20 / 3)

    def test_peso_zero_levanta_erro(self):
        with self.assertRaises(ValueError):
            media_ponderada([(8, 0)])

class TesteSituacao(unittest.TestCase):
    def test_limites(self):
        casos = [(7.0, "aprovado"), (6.99, "recuperação"),
                 (4.0, "recuperação"), (3.99, "reprovado")]
        for media, esperado in casos:
            with self.subTest(media=media):
                self.assertEqual(situacao(media), esperado)

    def test_nota_alta(self):
        self.assertEqual(situacao(10), "aprovado")

if __name__ == "__main__":
    unittest.main(verbosity=2, exit=False)
