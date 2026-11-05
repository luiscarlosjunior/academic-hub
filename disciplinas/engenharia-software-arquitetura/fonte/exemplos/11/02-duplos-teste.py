"""Dublês de teste: fake (verifica estado) versus mock (verifica interação).

Um serviço de matrícula envia um e-mail de confirmação. O teste com fake
verifica o resultado observável (a caixa de saída contém o e-mail). O teste
com mock verifica a chamada. A diferença importa quando a implementação muda.
"""
from unittest import TestCase, main
from unittest.mock import Mock

class CaixaEmMemoria:                      # fake: implementação simples e funcional
    def __init__(self):
        self.enviados = []
    def enviar(self, para, assunto):
        self.enviados.append((para, assunto))

def matricula(aluno, notificador):
    notificador.enviar(aluno, "Matrícula confirmada")
    return True

class TesteComFake(TestCase):
    def test_confirmacao_fica_na_caixa(self):
        caixa = CaixaEmMemoria()
        matricula("ana@exemplo.com", caixa)
        self.assertEqual(caixa.enviados, [("ana@exemplo.com", "Matrícula confirmada")])

class TesteComMock(TestCase):
    def test_chama_enviar_uma_vez(self):
        notificador = Mock()
        matricula("ana@exemplo.com", notificador)
        notificador.enviar.assert_called_once_with("ana@exemplo.com", "Matrícula confirmada")

if __name__ == "__main__":
    main(verbosity=2, exit=False)
