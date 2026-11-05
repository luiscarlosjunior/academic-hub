"""Arquitetura hexagonal: o núcleo depende de uma porta (interface), não de um banco.

O núcleo (ServicoPedidos) recebe um repositório por injeção. Nos testes,
um adaptador em memória (RepositorioEmMemoria) substitui o banco real.
"""
import unittest

class PedidoVazio(Exception):
    pass

class Pedido:
    def __init__(self, itens):
        self.itens = list(itens)
        self.total = sum(p * q for p, q in self.itens)

class ServicoPedidos:                      # núcleo: só conhece a porta
    def __init__(self, repositorio):
        self._repo = repositorio

    def criar(self, itens):
        if not itens:
            raise PedidoVazio("o pedido precisa de pelo menos um item")
        pedido = Pedido(itens)
        self._repo.salvar(pedido)
        return pedido

class RepositorioEmMemoria:               # adaptador de teste
    def __init__(self):
        self.salvos = []
    def salvar(self, pedido):
        self.salvos.append(pedido)

class TestesNucleo(unittest.TestCase):
    def test_total_e_salvo_na_porta(self):
        repo = RepositorioEmMemoria()
        pedido = ServicoPedidos(repo).criar([(10.0, 2), (5.5, 1)])
        self.assertEqual(pedido.total, 25.5)
        self.assertEqual(repo.salvos, [pedido])

    def test_pedido_vazio_nao_e_salvo(self):
        repo = RepositorioEmMemoria()
        with self.assertRaises(PedidoVazio):
            ServicoPedidos(repo).criar([])
        self.assertEqual(repo.salvos, [])

if __name__ == "__main__":
    unittest.main(verbosity=1, exit=False)
