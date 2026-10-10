"""
Tópico 3 · Relógios lógicos: Lamport e vetorial.
Execute com: python3 03-relogios-ordenacao.py
"""


class RelogioLamport:
    """Um inteiro por processo. Garante: a -> b implica L(a) < L(b). Não o contrário."""

    def __init__(self):
        self.L = 0

    def evento_local(self):
        self.L += 1
        return self.L

    def envia(self):
        self.L += 1
        return self.L

    def recebe(self, carimbo_msg):
        self.L = max(self.L, carimbo_msg) + 1
        return self.L


class RelogioVetorial:
    """Um vetor com uma posição por processo. Permite detectar concorrência."""

    def __init__(self, i, n):
        self.i = i              # índice deste processo
        self.v = [0] * n

    def evento_local(self):
        self.v[self.i] += 1
        return list(self.v)

    def envia(self):
        self.v[self.i] += 1
        return list(self.v)     # o vetor viaja com a mensagem

    def recebe(self, vetor_msg):
        self.v = [max(a, b) for a, b in zip(self.v, vetor_msg)]
        self.v[self.i] += 1
        return list(self.v)


def compara(a, b):
    """Relação causal entre dois vetores: antes, depois, igual ou concorrente."""
    menor_ou_igual_ab = all(x <= y for x, y in zip(a, b))
    menor_ou_igual_ba = all(y <= x for x, y in zip(a, b))
    if a == b:
        return "igual"
    if menor_ou_igual_ab:
        return "antes (a -> b)"
    if menor_ou_igual_ba:
        return "depois (b -> a)"
    return "concorrentes"


if __name__ == "__main__":
    # Mesmo cenário da animação: P1, P2 e P3 com sete eventos
    p1, p2, p3 = RelogioLamport(), RelogioLamport(), RelogioLamport()
    v1, v2, v3 = RelogioVetorial(0, 3), RelogioVetorial(1, 3), RelogioVetorial(2, 3)

    print("Lamport (L) e vetorial ([P1,P2,P3]) em cada evento:")
    e0 = (p1.evento_local(), v1.evento_local())
    print("  e0 P1 local          L =", e0[0], " v =", v1.v)
    m1_L, m1_v = p1.envia(), v1.envia()
    print("  e1 P1 envia m        L =", m1_L, " v =", m1_v)
    e2 = (p2.recebe(m1_L), v2.recebe(m1_v))
    print("  e2 P2 recebe m       L =", e2[0], " v =", e2[1])
    e3 = (p3.evento_local(), v3.evento_local())
    print("  e3 P3 local          L =", e3[0], " v =", e3[1])
    m2_L, m2_v = p2.envia(), v2.envia()
    print("  e4 P2 envia m'       L =", m2_L, " v =", m2_v)
    e5 = (p3.recebe(m2_L), v3.recebe(m2_v))
    print("  e5 P3 recebe m'      L =", e5[0], " v =", e5[1])
    e6 = (p1.evento_local(), v1.evento_local())
    print("  e6 P1 local          L =", e6[0], " v =", e6[1])

    print("\nRelação entre eventos, com vetores:")
    print("  e2 e e6:", compara(e2[1], e6[1]))
    print("  e3 e e4:", compara(e3[1], m2_v))
    print("  e1 e e5:", compara(m1_v, e5[1]))

    print("\nCom Lamport, a comparação L(e2)=3 e L(e6)=3 não diz nada:")
    print("  L(e2) < L(e6)?", e2[0] < e6[0], "  L(e6) < L(e2)?", e6[0] < e2[0])
