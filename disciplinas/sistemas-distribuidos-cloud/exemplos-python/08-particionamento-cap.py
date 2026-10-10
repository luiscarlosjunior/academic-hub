"""
Tópico 8 · Particionamento com hash consistente e o trade-off CAP.
Execute com: python3 08-particionamento-cap.py
"""
import bisect
import hashlib
import statistics


def posicao(texto):
    """Posição estável no anel de 2^32, igual em todas as execuções."""
    return int(hashlib.md5(texto.encode()).hexdigest(), 16) % (2 ** 32)


class AnelHash:
    """Hash consistente com nós virtuais: cada servidor ocupa `virtuais` posições."""

    def __init__(self, servidores, virtuais=1):
        self.virtuais = virtuais
        self.anel = []
        for s in servidores:
            self.adiciona(s)

    def adiciona(self, servidor):
        for v in range(self.virtuais):
            bisect.insort(self.anel, (posicao(f"{servidor}#{v}"), servidor))

    def remove(self, servidor):
        self.anel = [(p, s) for p, s in self.anel if s != servidor]

    def responsavel(self, chave):
        i = bisect.bisect_left(self.anel, (posicao(chave),))
        return self.anel[i % len(self.anel)][1]


def distribuicao(anel, chaves):
    contagem = {}
    for c in chaves:
        s = anel.responsavel(c)
        contagem[s] = contagem.get(s, 0) + 1
    return contagem


def chaves_movidas(antes, depois, chaves):
    return sum(antes.responsavel(c) != depois.responsavel(c) for c in chaves)


def cap_sim(leituras=10):
    """Duas réplicas de um saldo, A (lado da maioria) e B (isolada por partição).

    A escrita de um saque de 30 é aceita por A: o saldo real vira 70.
    Durante a partição, B precisa escolher o que fazer com as leituras:
    CP recusa (preserva consistência); AP responde com o próprio valor (preserva disponibilidade).
    """
    saldo_real = 100 - 30    # escrita confirmada em A
    saldo_em_b = 100         # B não recebeu a escrita
    resultados = {}
    for modo in ("CP", "AP"):
        r = {"respondeu": 0, "recusou": 0, "valor_antigo": 0}
        for _ in range(leituras):
            if modo == "CP":
                r["recusou"] += 1
                continue
            r["respondeu"] += 1
            if saldo_em_b != saldo_real:
                r["valor_antigo"] += 1
        resultados[modo] = r
    return resultados


if __name__ == "__main__":
    chaves = [f"cliente-{i}" for i in range(10000)]

    print("--- Balanceamento: 4 servidores, com e sem nós virtuais ---")
    for v in (1, 100):
        anel = AnelHash(["A", "B", "C", "D"], virtuais=v)
        cont = distribuicao(anel, chaves)
        valores = sorted(cont.values())
        desvio = statistics.pstdev(valores)
        print(f"  nós virtuais = {v:3d}: min={valores[0]:5d} max={valores[-1]:5d} desvio={desvio:7.1f}")

    print("\n--- Movimento de chaves ao adicionar um 5º servidor ---")
    for v in (1, 100):
        antes = AnelHash(["A", "B", "C", "D"], virtuais=v)
        depois = AnelHash(["A", "B", "C", "D", "E"], virtuais=v)
        movidas = chaves_movidas(antes, depois, chaves)
        print(f"  nós virtuais = {v:3d}: {movidas} de {len(chaves)} chaves mudaram ({movidas / len(chaves):.1%})")
    print("  esperado com hash consistente: cerca de 1/5 = 20%")

    print("\n--- Hash mod N: mesmo cenário ---")
    mod4 = sum(posicao(c) % 4 != posicao(c) % 5 for c in chaves)
    print(f"  mod 4 -> mod 5: {mod4} de {len(chaves)} chaves mudaram")

    print("\n--- CAP: réplica isolada durante uma partição (10 leituras) ---")
    for modo, r in cap_sim().items():
        print(f"  {modo}: respondeu={r['respondeu']:2d} recusou={r['recusou']:2d} "
              f"valor_antigo={r['valor_antigo']:2d}")
