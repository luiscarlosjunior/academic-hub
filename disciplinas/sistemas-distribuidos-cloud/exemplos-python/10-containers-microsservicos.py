"""
Tópico 10 · Laço de reconciliação de um orquestrador, com falhas e atraso de inicialização.
Execute com: python3 10-containers-microsservicos.py
"""
import random


class Orquestrador:
    """Compara o estado desejado com o atual a cada intervalo e age para igualá-los.

    Um pod novo leva `atraso` intervalos para ficar rodando. Cada pod rodando pode
    falhar com probabilidade `p_falha` em cada intervalo.
    """

    def __init__(self, desejado, atraso=2, p_falha=0.03, semente=5):
        self.desejado = desejado
        self.atraso = atraso
        self.p_falha = p_falha
        self.rng = random.Random(semente)
        self.rodando = desejado     # pods em execução
        self.pendentes = []         # tempo restante até cada pod pendente ficar pronto

    def intervalo(self):
        # 1. falhas aleatórias nos pods rodando
        sobreviventes = sum(1 for _ in range(self.rodando) if self.rng.random() >= self.p_falha)
        self.rodando = sobreviventes
        # 2. pendentes avançam; os prontos passam a rodar
        novos = []
        for resta in self.pendentes:
            if resta - 1 <= 0:
                self.rodando += 1
            else:
                novos.append(resta - 1)
        self.pendentes = novos
        # 3. reconciliação: cria pods até rodando + pendentes igualar o desejado
        faltam = self.desejado - (self.rodando + len(self.pendentes))
        for _ in range(max(0, faltam)):
            self.pendentes.append(self.atraso)
        # devolve (capacidade plena, pelo menos um pod atendendo)
        return self.rodando >= self.desejado, self.rodando >= 1


def simula(desejado, intervalos=1000, **kwargs):
    orq = Orquestrador(desejado, **kwargs)
    plena = atende = 0
    for _ in range(intervalos):
        p, a = orq.intervalo()
        plena += p
        atende += a
    return plena / intervalos, atende / intervalos


if __name__ == "__main__":
    print("Laço de reconciliação, 1000 intervalos, pod novo leva 2 intervalos para ficar pronto")
    print("e cada pod falha com probabilidade 3% por intervalo.")
    print(f"  {'desejado':>8}  {'capacidade plena':>17}  {'pelo menos 1 pod':>17}")
    for n in (1, 3, 5):
        plena, atende = simula(n)
        print(f"  {n:>8}  {plena * 100:>16.1f}%  {atende * 100:>16.1f}%")

    print("\nEfeito do atraso de inicialização (desejado = 3, capacidade plena):")
    for atraso in (1, 2, 5):
        plena, _ = simula(3, atraso=atraso)
        print(f"  atraso = {atraso} intervalo(s): {plena * 100:.1f}%")
