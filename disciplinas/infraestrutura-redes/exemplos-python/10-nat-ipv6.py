"""NAT com tradução de portas (NAPT), endereços IPv6 e EUI-64.

Parte 1: uma tabela de NAPT. Dois hosts privados usam a mesma porta de origem; o
  NAT dá a cada um uma porta pública diferente, e usa a tabela para devolver a
  resposta ao host certo. Um pacote sem entrada na tabela é descartado.
Parte 2: IPv6. Compressão de endereços, e o endereço de interface gerado a partir
  do MAC pelo método EUI-64 (RFC 4291).
Parte 3: quantas sub-redes /64 cabem numa /48, e por que o IPv6 não precisa de NAT.
"""
import ipaddress


class NAT:
    def __init__(self, ip_publico, primeira_porta=40000):
        self.ip_publico = ip_publico
        self.proxima = primeira_porta
        self.ida = {}      # (ip_privado, porta_privada) -> porta_publica
        self.volta = {}    # porta_publica -> (ip_privado, porta_privada)

    def saida(self, ip_privado, porta_privada):
        chave = (ip_privado, porta_privada)
        if chave not in self.ida:
            self.ida[chave] = self.proxima
            self.volta[self.proxima] = chave
            self.proxima += 1
        return self.ip_publico, self.ida[chave]

    def entrada(self, porta_publica):
        """Retorna o host de destino, ou None se não há entrada (pacote não solicitado)."""
        return self.volta.get(porta_publica)


def eui64(mac: str) -> str:
    """Gera a parte de interface de 64 bits a partir de um MAC de 48 bits.
    Insere ff:fe no meio e inverte o bit de administração local (7º bit do 1º byte)."""
    partes = [int(p, 16) for p in mac.split(":")]
    partes[0] ^= 0x02
    interface = partes[:3] + [0xFF, 0xFE] + partes[3:]
    return ":".join(f"{interface[i]:02x}{interface[i + 1]:02x}" for i in range(0, 8, 2))


if __name__ == "__main__":
    print("Parte 1: NAPT com dois hosts usando a mesma porta de origem")
    nat = NAT("200.1.1.5")
    servidor = ("93.184.216.34", 80)
    trocas = [("192.168.0.10", 51234), ("192.168.0.11", 51234), ("192.168.0.10", 51234)]
    for ip, porta in trocas:
        pub_ip, pub_porta = nat.saida(ip, porta)
        print(f"  {ip}:{porta} -> {pub_ip}:{pub_porta} -> {servidor[0]}:{servidor[1]}")

    print("  resposta chegando ao NAT:")
    for porta in (40000, 40001, 40005):
        destino = nat.entrada(porta)
        if destino is None:
            print(f"    porta {porta}: sem entrada na tabela, descartada")
        else:
            print(f"    porta {porta}: entregue a {destino[0]}:{destino[1]}")

    print("\nParte 2: IPv6")
    completo = "2001:0db8:0000:0000:0000:ff00:0042:8329"
    print(f"  completo:   {completo}")
    print(f"  comprimido: {ipaddress.IPv6Address(completo).compressed}")
    print(f"  EUI-64 de 3c:22:fb:01:02:03 -> fe80::{eui64('3c:22:fb:01:02:03')}")

    print("\nParte 3: sub-redes e escala")
    organizacao = ipaddress.IPv6Network("2001:db8:abcd::/48")
    print(f"  /48 tem {2 ** (64 - 48)} sub-redes /64")
    print(f"  primeira delas: {next(organizacao.subnets(new_prefix=64))}")
    print(f"  cada /64 tem {2 ** 64} endereços")
    print(f"  total de endereços IPv4: {2 ** 32}; de IPv6: 2^128")
