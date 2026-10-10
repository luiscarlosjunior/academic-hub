"""
Tópico 6 · Consenso por maioria: eleição de líder, partições e segurança.
Execute com: python3 06-consenso-tolerancia-falhas.py
"""
import random


class Cluster:
    """Eleição estilo Raft: em cada termo, cada servidor vota no máximo uma vez.

    Um candidato vira líder só com votos de uma maioria (n // 2 + 1 servidores).
    Servidores fora da partição do candidato, ou falhos, não votam.
    """

    def __init__(self, n):
        self.n = n
        self.maioria = n // 2 + 1
        self.voto_no_termo = {}   # (termo, servidor) -> candidato em que votou

    def pede_votos(self, termo, candidato, alcancaveis):
        votos = 1                 # o candidato vota em si mesmo
        self.voto_no_termo[(termo, candidato)] = candidato
        for s in alcancaveis:
            if s == candidato:
                continue
            if (termo, s) not in self.voto_no_termo:
                self.voto_no_termo[(termo, s)] = candidato
                votos += 1
        return votos >= self.maioria


def cenario_deterministico():
    print("Cinco servidores, maioria = 3.")
    c = Cluster(5)
    print("  Sem partição, S1 pede votos: lidera?", c.pede_votos(2, 0, range(5)))

    c = Cluster(5)
    lado_a, lado_b = [0, 1], [2, 3, 4]
    print("  Partição {S1,S2} | {S3,S4,S5}:")
    print("    S1 pede votos no lado A: lidera?", c.pede_votos(2, 0, lado_a))
    print("    S3 pede votos no lado B: lidera?", c.pede_votos(2, 2, lado_b))


def simula_seguranca(trials=5000, n=5, semente=3):
    """Em partições e falhas aleatórias, nunca deve haver dois líderes no mesmo termo."""
    rng = random.Random(semente)
    eleicoes_bem_sucedidas = 0
    dois_lideres = 0
    sem_lider = 0
    for _ in range(trials):
        c = Cluster(n)
        termo = 1
        falhos = set(rng.sample(range(n), rng.randint(0, 2)))
        vivos = [s for s in range(n) if s not in falhos]
        rng.shuffle(vivos)
        corte = rng.randint(1, len(vivos) - 1) if len(vivos) > 1 else len(vivos)
        lado = [vivos[:corte], vivos[corte:]]
        lideres = []
        for grupo in lado:
            if not grupo:
                continue
            candidato = rng.choice(grupo)
            if c.pede_votos(termo, candidato, grupo):
                lideres.append(candidato)
        if len(lideres) > 1:
            dois_lideres += 1
        elif len(lideres) == 1:
            eleicoes_bem_sucedidas += 1
        else:
            sem_lider += 1
    return eleicoes_bem_sucedidas, sem_lider, dois_lideres


if __name__ == "__main__":
    cenario_deterministico()

    ok, sem, dois = simula_seguranca()
    print("\nSimulação com 5000 cenários aleatórios (partição e até duas falhas):")
    print(f"  com exatamente um líder: {ok}")
    print(f"  sem líder (nenhum lado tinha maioria): {sem}")
    print(f"  com dois líderes no mesmo termo: {dois}")
    print("  Modelo simplificado: um termo e dois lados. Duas maiorias de 5 sempre se cruzam,")
    print("  e cada servidor vota uma vez por termo: dois líderes no mesmo termo são impossíveis.")
