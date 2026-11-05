"""Fase VERMELHA do TDD: o teste é escrito antes da implementação.

A função situacao ainda não existe de verdade; o esqueleto apenas lança
NotImplementedError. A execução do teste deve falhar, e a falha prova que
o teste verifica algo que ainda não existe.
"""
import unittest

def situacao(media):
    raise NotImplementedError

class TesteSituacao(unittest.TestCase):
    def test_media_7_ou_mais_e_aprovado(self):
        self.assertEqual(situacao(7.0), "aprovado")

    def test_media_entre_4_e_7_vai_para_recuperacao(self):
        self.assertEqual(situacao(5.0), "recuperação")

if __name__ == "__main__":
    unittest.main(verbosity=2, exit=False)
