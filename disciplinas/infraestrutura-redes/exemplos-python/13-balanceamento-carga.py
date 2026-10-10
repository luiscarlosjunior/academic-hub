"""Balanceamento de carga: hash módulo N, consistent hashing e health checks.

Parte 1: distribuição de conexões com hash módulo N. Quando um servidor sai,
  quase todas as conexões mudam de destino (quebra o estado de sessão).
Parte 2: consistent hashing com nós virtuais. Quando um servidor sai, só as
  conexões que estavam nele mudam de destino.
Parte 3: health check. O balanceador só envia tráfego para servidores saudáveis,
  e remove um servidor depois de falhas consecutivas.
"""
import bisect
import hashlib


def h(texto: str) -> int:
    return int(hashlib.md5(texto.encode()).hexdigest(), 16)


CONEXOES = [f"cliente-{i}" for i in range(1000)]


def modulo(conexao, servidores):
    return servidores[h(conexao) % len(servidores)]


class AnelConsistente:
    def __init__(self, servidores, replicas=100):
        self.anel = []
        for s in servidores:
            for r in range(replicas):
                self.anel.append((h(f"{s}#{r}"), s))
        self.anel.sort()
        self.chaves = [p for p, _ in self.anel]

    def escolhe(self, conexao):
        i = bisect.bisect(self.chaves, h(conexao)) % len(self.anel)
        return self.anel[i][1]


class HealthCheck:
    """Remove o servidor após 3 falhas seguidas e o reintegra após 2 sucessos."""

    def __init__(self, servidores):
        self.falhas = {s: 0 for s in servidores}
        self.sucessos = {s: 0 for s in servidores}
        self.ativos = set(servidores)

    def registra(self, servidor, ok):
        if ok:
            self.falhas[servidor] = 0
            if servidor not in self.ativos:
                self.sucessos[servidor] += 1
                if self.sucessos[servidor] >= 2:
                    self.ativos.add(servidor)
        else:
            self.sucessos[servidor] = 0
            self.falhas[servidor] += 1
            if self.falhas[servidor] >= 3:
                self.ativos.discard(servidor)


if __name__ == "__main__":
    print("Parte 1: hash módulo N, 1000 conexões, servidor B sai")
    antes = ["A", "B", "C", "D"]
    depois = ["A", "C", "D"]
    mudou = sum(1 for c in CONEXOES if modulo(c, antes) != modulo(c, depois))
    print(f"  distribuição antes: { {s: sum(1 for c in CONEXOES if modulo(c, antes) == s) for s in antes} }")
    print(f"  conexões que mudaram de servidor: {mudou} de {len(CONEXOES)} ({100 * mudou / len(CONEXOES):.1f}%)")

    print("\nParte 2: consistent hashing, mesmo cenário")
    anel_antes = AnelConsistente(antes)
    anel_depois = AnelConsistente(depois)
    mudou_anel = sum(1 for c in CONEXOES if anel_antes.escolhe(c) != anel_depois.escolhe(c))
    print(f"  conexões que mudaram de servidor: {mudou_anel} de {len(CONEXOES)} ({100 * mudou_anel / len(CONEXOES):.1f}%)")
    print(f"  esperado (só as que estavam em B, ~1/4): ~{100 // len(antes)}%")

    print("\nParte 3: health check, servidor B falha e se recupera")
    hc = HealthCheck(["A", "B", "C"])
    eventos = [("B", False), ("B", False), ("B", False), ("B", True), ("B", True), ("A", True)]
    for servidor, ok in eventos:
        hc.registra(servidor, ok)
        print(f"  {servidor} {'ok  ' if ok else 'falha'} -> ativos: {sorted(hc.ativos)}")
