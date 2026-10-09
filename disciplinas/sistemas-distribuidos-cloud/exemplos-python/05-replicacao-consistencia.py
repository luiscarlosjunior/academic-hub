"""
Tópico 5 · Replicação com quóruns: W, R e leituras desatualizadas.
Execute com: python3 05-replicacao-consistencia.py
"""
import random


class Replica:
    def __init__(self, nome):
        self.nome = nome
        self.valor = "A"
        self.versao = 1


class Cluster:
    """N réplicas. Escrita confirmada com W réplicas; leitura consulta R e fica com a versão mais nova."""

    def __init__(self, n, rng):
        self.replicas = [Replica(f"R{i + 1}") for i in range(n)]
        self.rng = rng
        self.versao_global = 1

    def escreve(self, valor, w):
        """Atualiza W réplicas escolhidas ao acaso (as outras ficam para trás)."""
        self.versao_global += 1
        alvo = self.rng.sample(self.replicas, w)
        for r in alvo:
            r.valor = valor
            r.versao = self.versao_global
        return alvo

    def le(self, r):
        """Consulta R réplicas ao acaso e devolve a de versão mais nova."""
        consultadas = self.rng.sample(self.replicas, r)
        return max(consultadas, key=lambda rep: rep.versao)


def taxa_desatualizada(n, w, r, tentativas=20000, semente=42):
    """Fração de leituras, feitas após uma escrita confirmada, que devolvem valor antigo."""
    rng = random.Random(semente)
    desatualizadas = 0
    for _ in range(tentativas):
        cluster = Cluster(n, rng)
        cluster.escreve("B", w)
        if cluster.le(r).valor != "B":
            desatualizadas += 1
    return desatualizadas / tentativas


if __name__ == "__main__":
    print("N = 3. Fração de leituras desatualizadas, depois de uma escrita confirmada:")
    print(f"  {'W':>2} {'R':>2}  {'W+R > N?':>9}  {'desatualizadas':>15}")
    for w, r in [(1, 1), (2, 1), (1, 2), (2, 2), (3, 1)]:
        taxa = taxa_desatualizada(3, w, r)
        sobreposto = "sim" if w + r > 3 else "não"
        print(f"  {w:>2} {r:>2}  {sobreposto:>9}  {taxa * 100:14.1f}%")
    print("\nCom W + R > N, a sobreposição garante leitura atual. Sem ela, a leitura pode ser antiga.")
