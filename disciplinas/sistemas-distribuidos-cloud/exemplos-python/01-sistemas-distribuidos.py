"""
Tópico 1 · Rede assíncrona com perda, duplicação e atraso variável.
Execute com: python3 01-sistemas-distribuidos.py
"""
import heapq
import random


class Rede:
    """Modelo simplificado de rede assíncrona: não há limite para o atraso.

    Cada mensagem pode ser perdida, duplicada ou atrasada por um tempo aleatório.
    O remetente não recebe aviso de nada disso.
    """

    def __init__(self, semente, perda=0.2, duplicacao=0.1, atraso=(1, 6)):
        self.rng = random.Random(semente)
        self.perda = perda
        self.duplicacao = duplicacao
        self.atraso = atraso

    def transmite(self, mensagem, envio):
        """Devolve a lista de (instante de chegada, mensagem). Pode ser vazia."""
        chegadas = []
        copias = 2 if self.rng.random() < self.duplicacao else 1
        for _ in range(copias):
            if self.rng.random() < self.perda:
                continue
            chegadas.append((envio + self.rng.randint(*self.atraso), mensagem))
        return chegadas


def simula(n_mensagens=8):
    rede = Rede(semente=7)
    eventos = []
    for i in range(n_mensagens):
        for chegada, msg in rede.transmite(f"m{i + 1}", envio=i):
            heapq.heappush(eventos, (chegada, msg))

    print("Chegadas, na ordem em que acontecem:")
    ordem_chegada = []
    vistas = set()
    while eventos:
        t, msg = heapq.heappop(eventos)
        duplicata = msg in vistas
        vistas.add(msg)
        ordem_chegada.append(msg)
        marca = "  (duplicata: o receptor descarta)" if duplicata else ""
        print(f"  t={t:2d}  {msg}{marca}")

    enviadas = [f"m{i + 1}" for i in range(n_mensagens)]
    perdidas = [m for m in enviadas if m not in vistas]
    print("Perdidas (nunca chegaram):", perdidas)

    posicao = {m: k for k, m in enumerate(enviadas)}
    inversoes = sum(
        1
        for a in range(len(ordem_chegada))
        for b in range(a + 1, len(ordem_chegada))
        if posicao[ordem_chegada[a]] > posicao[ordem_chegada[b]]
    )
    print("Pares fora de ordem na chegada:", inversoes)


if __name__ == "__main__":
    simula()
