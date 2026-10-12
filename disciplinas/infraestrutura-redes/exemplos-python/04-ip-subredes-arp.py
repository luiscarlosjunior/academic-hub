"""Sub-redes IPv4 e a decisão de envio direto ou pelo gateway.

Parte 1: calcula rede, broadcast, máscara e hosts úteis de uma sub-rede (CIDR).
Parte 2: divide uma rede em sub-redes menores.
Parte 3: decide, com AND bit a bit, se um destino está na mesma sub-rede.
         Se não estiver, o host envia o quadro ao gateway (e usa ARP para o MAC dele).
"""
import ipaddress


def para_inteiro(ip: str) -> int:
    return int(ipaddress.IPv4Address(ip))


def mesma_sub_rede(origem: str, destino: str, mascara: str) -> bool:
    """Compara (IP AND máscara) dos dois endereços, como o host faz antes de enviar."""
    m = para_inteiro(mascara)
    return (para_inteiro(origem) & m) == (para_inteiro(destino) & m)


def prefixo_para_hosts(n_hosts: int) -> int:
    """Menor prefixo cuja sub-rede tem espaço para n_hosts (sem contar rede e broadcast)."""
    bits = 0
    while (2 ** bits) - 2 < n_hosts:
        bits += 1
    return 32 - bits


if __name__ == "__main__":
    print("Parte 1: anatomia de uma sub-rede")
    rede = ipaddress.ip_network("192.168.10.0/26")
    print(f"  rede:        {rede.network_address}")
    print(f"  broadcast:   {rede.broadcast_address}")
    print(f"  máscara:     {rede.netmask}")
    print(f"  endereços:   {rede.num_addresses} (hosts úteis: {rede.num_addresses - 2})")
    hosts = list(rede.hosts())
    print(f"  primeiro host: {hosts[0]}, último host: {hosts[-1]}")

    print("\nParte 2: dividindo 192.168.10.0/24 em sub-redes /26")
    for sub in ipaddress.ip_network("192.168.10.0/24").subnets(new_prefix=26):
        print(f"  {str(sub):<18} hosts úteis: {sub.num_addresses - 2}")

    print("\nParte 3: destino local ou pelo gateway? (host 192.168.10.10/26)")
    mascara = "255.255.255.192"
    gateway = "192.168.10.1"
    for destino in ("192.168.10.55", "192.168.10.70", "8.8.8.8"):
        local = mesma_sub_rede("192.168.10.10", destino, mascara)
        proximo = destino if local else gateway
        via = "envio direto" if local else "envio ao gateway"
        print(f"  destino {destino:<14} -> {via}; ARP para {proximo}")

    print("\nParte 4: prefixo necessário para N hosts")
    for n in (10, 50, 100, 1000):
        p = prefixo_para_hosts(n)
        print(f"  {n:>5} hosts -> /{p} ({2 ** (32 - p) - 2} úteis)")
