"""
Sistemas distribuídos: relógio lógico de Lamport e hash consistente.
Execute com: python3 01-sistemas-distribuidos.py
"""
import bisect
import hashlib


class RelogioLamport:
    """Contador lógico de um processo. Guarda só um inteiro, não o tempo físico."""

    def __init__(self):
        self.L = 0

    def evento_local(self):
        self.L += 1
        return self.L

    def envia(self):
        # envio é um evento: avança o relógio e carrega o carimbo na mensagem
        self.L += 1
        return self.L

    def recebe(self, carimbo_msg):
        # max(local, mensagem) + 1 garante que o recebimento venha depois do envio
        self.L = max(self.L, carimbo_msg) + 1
        return self.L


def hash_posicao(texto):
    """Espalha um texto num anel de 2^32 posições de forma estável entre execuções."""
    return int(hashlib.md5(texto.encode()).hexdigest(), 16) % (2 ** 32)


class AnelHash:
    """Hash consistente: cada chave pertence ao primeiro servidor no sentido horário."""

    def __init__(self, servidores=(), replicas=1):
        self.replicas = replicas
        self.anel = []  # lista ordenada de (posição, servidor)
        for s in servidores:
            self.adiciona(s)

    def adiciona(self, servidor):
        for r in range(self.replicas):
            bisect.insort(self.anel, (hash_posicao(f"{servidor}#{r}"), servidor))

    def responsavel(self, chave):
        pos = hash_posicao(chave)
        i = bisect.bisect_left(self.anel, (pos,))
        if i == len(self.anel):  # passou do fim do anel: volta ao início
            i = 0
        return self.anel[i][1]


def mod_n(chave, n):
    """Divisão tradicional por resto: trocar N muda a maior parte das chaves."""
    return hash_posicao(chave) % n


if __name__ == "__main__":
    print("--- Relógio de Lamport: P1 -> P2 -> P3 ---")
    p1, p2, p3 = RelogioLamport(), RelogioLamport(), RelogioLamport()
    p1.evento_local()                      # L = 1
    m = p1.envia()                         # L = 2, carimbo na mensagem
    print("P2 recebe m:", p2.recebe(m))    # max(0, 2) + 1 = 3
    print("P3 evento local:", p3.evento_local())
    m2 = p2.envia()                        # L = 4
    print("P3 recebe m':", p3.recebe(m2))  # max(1, 4) + 1 = 5

    print("\n--- Hash consistente: 3 servidores e depois 4 ---")
    chaves = [f"usuario{i}" for i in range(1000)]
    anel = AnelHash(["A", "B", "C"], replicas=50)
    antes = {c: anel.responsavel(c) for c in chaves}
    anel.adiciona("D")
    depois = {c: anel.responsavel(c) for c in chaves}
    movidas = sum(antes[c] != depois[c] for c in chaves)
    print(f"hash consistente: {movidas} de {len(chaves)} chaves mudaram de servidor")

    movidas_mod = sum(mod_n(c, 3) != mod_n(c, 4) for c in chaves)
    print(f"hash mod N (3 -> 4): {movidas_mod} de {len(chaves)} chaves mudaram")
