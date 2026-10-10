"""Controle de congestionamento do TCP e policiamento de tráfego com balde de fichas.

Parte 1: janela de congestionamento (cwnd) em RTTs, com slow start e AIMD.
  - Tahoe: qualquer perda (timeout) volta a cwnd = 1.
  - Reno: três ACKs duplicados reduzem cwnd pela metade (recuperação rápida).
Parte 2: balde de fichas (token bucket): aceita rajadas até a capacidade e
  limita a taxa média, como um policiador de QoS.
"""


def simula_cwnd(rtts, perda_em, modo):
    """Retorna linhas (RTT, janela usada, ssthresh, evento) para cada RTT."""
    cwnd, ssthresh = 1, 16
    linhas = []
    for t in range(1, rtts + 1):
        usada = cwnd
        if t == perda_em:
            ssthresh = max(usada // 2, 2)
            if modo == "reno":
                cwnd = ssthresh
                evento = "3 ACKs duplicados: cwnd = ssthresh"
            else:
                cwnd = 1
                evento = "timeout: cwnd = 1"
        elif cwnd < ssthresh:
            cwnd *= 2
            evento = "slow start: dobra"
        else:
            cwnd += 1
            evento = "avoidance: +1 por RTT"
        linhas.append((t, usada, ssthresh, evento))
    return linhas


class BaldeDeFichas:
    """Recebe fichas à taxa constante. Cada pacote gasta fichas; sem fichas, é descartado."""

    def __init__(self, taxa, capacidade):
        self.taxa = taxa
        self.capacidade = capacidade
        self.fichas = capacidade
        self.ultimo = 0

    def aceita(self, instante, tamanho=1):
        self.fichas = min(self.capacidade, self.fichas + (instante - self.ultimo) * self.taxa)
        self.ultimo = instante
        if self.fichas >= tamanho:
            self.fichas -= tamanho
            return True
        return False


if __name__ == "__main__":
    print("Parte 1: cwnd por RTT, perda no RTT 8")
    for modo in ("tahoe", "reno"):
        print(f"  {modo.upper()}")
        print("    RTT  janela  ssthresh  evento")
        for t, usada, ss, ev in simula_cwnd(12, perda_em=8, modo=modo):
            print(f"    {t:>3}  {usada:>6}  {ss:>8}  {ev}")
        print()

    print("Parte 2: balde de fichas, taxa 1 pacote/s, capacidade 3")
    balde = BaldeDeFichas(taxa=1, capacidade=3)
    chegadas = [0, 0, 0, 0, 0, 1, 2, 2, 2, 3, 6, 7]
    aceitos = 0
    for i, t in enumerate(chegadas, start=1):
        ok = balde.aceita(t)
        aceitos += ok
        print(f"  pacote {i:>2} em t={t}: {'aceito' if ok else 'descartado'} "
              f"(fichas restantes: {balde.fichas:.0f})")
    print(f"  aceitos {aceitos} de {len(chegadas)}")
