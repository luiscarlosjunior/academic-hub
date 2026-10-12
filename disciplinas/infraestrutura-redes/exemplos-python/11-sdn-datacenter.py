"""Redes de datacenter e SDN: ECMP em leaf-spine e tabela de fluxos programável.

Parte 1: topologia leaf-spine. Cada leaf se liga a todos os spines. Entre dois leafs
  há vários caminhos de igual custo, e o ECMP escolhe um por fluxo, usando o hash
  do 5-tupla (origem, destino, portas e protocolo). O mesmo fluxo sempre vai pelo
  mesmo spine, o que preserva a ordem dos pacotes.
Parte 2: SDN. O plano de controle (controlador) instala regras na tabela do switch;
  o plano de dados só casa pacotes com as regras, da de maior prioridade para a menor.
"""
import zlib

SPINES = ["spine-1", "spine-2"]


def escolhe_spine(src, dst, sport, dport, proto="tcp"):
    """ECMP: hash do 5-tupla, módulo o número de caminhos."""
    chave = f"{src}|{dst}|{sport}|{dport}|{proto}".encode()
    return SPINES[zlib.crc32(chave) % len(SPINES)]


class Switch:
    """Plano de dados: tabela de regras (prioridade, condição, ação)."""

    def __init__(self):
        self.tabela = []

    def instala(self, prioridade, condicao, acao):
        self.tabela.append((prioridade, condicao, acao))
        self.tabela.sort(key=lambda r: -r[0])

    def processa(self, pacote):
        for _, condicao, acao in self.tabela:
            if all(pacote.get(k) == v for k, v in condicao.items()):
                return acao
        return "envia ao controlador (packet-in)"


if __name__ == "__main__":
    print("Parte 1: ECMP entre dois spines")
    fluxos = [
        ("10.1.1.10", "10.2.1.20", 50001, 443),
        ("10.1.1.10", "10.2.1.20", 50002, 443),
        ("10.1.1.11", "10.2.1.20", 50003, 443),
        ("10.1.1.11", "10.2.1.21", 50004, 80),
        ("10.1.1.12", "10.2.1.22", 50005, 443),
        ("10.1.1.12", "10.2.1.22", 50006, 22),
        ("10.1.1.13", "10.2.1.23", 50007, 443),
        ("10.1.1.13", "10.2.1.23", 50008, 3306),
    ]
    contagem = {s: 0 for s in SPINES}
    for src, dst, sp, dp in fluxos:
        s = escolhe_spine(src, dst, sp, dp)
        contagem[s] += 1
        print(f"  {src}:{sp} -> {dst}:{dp}  ->  {s}")
    print(f"  distribuição: {contagem}")
    primeiro = escolhe_spine(*fluxos[0])
    repetido = escolhe_spine(*fluxos[0])
    print(f"  mesmo fluxo, duas vezes: {primeiro} e {repetido} (determinístico: {primeiro == repetido})")

    print("\nParte 2: SDN, regras instaladas pelo controlador")
    sw = Switch()
    sw.instala(100, {"dst_port": 23}, "descarta")          # telnet: bloqueado
    sw.instala(50, {"dst_port": 443}, "porta 2")           # web: encaminha
    sw.instala(10, {"proto": "udp", "dst_port": 53}, "porta 3")  # DNS
    pacotes = [
        {"proto": "tcp", "dst_port": 23},
        {"proto": "tcp", "dst_port": 443},
        {"proto": "udp", "dst_port": 53},
        {"proto": "tcp", "dst_port": 8080},
    ]
    for p in pacotes:
        print(f"  {p} -> {sw.processa(p)}")
