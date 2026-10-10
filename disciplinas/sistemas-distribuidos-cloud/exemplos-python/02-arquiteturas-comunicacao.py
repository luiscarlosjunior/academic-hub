"""
Tópico 2 · Chamada remota com reenvio: efeito da idempotência.
Execute com: python3 02-arquiteturas-comunicacao.py
"""
import random


class Servidor:
    """Banco de contas. Com idempotencia=True, lembra os identificadores já processados."""

    def __init__(self, saldo_inicial, idempotencia):
        self.saldo = saldo_inicial
        self.idempotencia = idempotencia
        self.processados = {}   # id -> resposta guardada
        self.execucoes = 0      # quantas vezes o débito foi de fato aplicado

    def debita(self, id_req, valor):
        if self.idempotencia and id_req in self.processados:
            return self.processados[id_req]   # repetição: devolve a resposta, sem debitar
        self.saldo -= valor
        self.execucoes += 1
        resposta = "ok"
        if self.idempotencia:
            self.processados[id_req] = resposta
        return resposta


def chama_com_reenvio(servidor, rng, id_req, valor, perda_resposta, tentativas=5):
    """Cliente: reenvia enquanto não recebe resposta (timeout = resposta não chegou)."""
    for tentativa in range(1, tentativas + 1):
        resposta = servidor.debita(id_req, valor)  # o servidor sempre processa o que chega
        if rng.random() < perda_resposta:
            continue                               # resposta perdida: o cliente não sabe do débito
        return resposta, tentativa
    return None, tentativas


def experimento(idempotencia, semente=11, pedidos=20, valor=10, perda_resposta=0.3):
    rng = random.Random(semente)
    servidor = Servidor(saldo_inicial=500, idempotencia=idempotencia)
    reenvios = 0
    for n in range(1, pedidos + 1):
        _, tentativas = chama_com_reenvio(servidor, rng, f"pedido-{n}", valor, perda_resposta)
        reenvios += tentativas - 1
    esperado = 500 - pedidos * valor
    return servidor, reenvios, esperado


if __name__ == "__main__":
    for idem in (False, True):
        s, reenvios, esperado = experimento(idem)
        rotulo = "com identificador (idempotente)" if idem else "sem identificador"
        print(f"{rotulo}:")
        print(f"  reenvios feitos pelo cliente: {reenvios}")
        print(f"  débitos aplicados: {s.execucoes} (pedidos de origem: 20)")
        print(f"  saldo final: {s.saldo} (esperado: {esperado})")
