"""Redes em cloud e diagnóstico: planejamento de VPC, rotas, traceroute e filtros.

Parte 1: uma VPC 10.0.0.0/16 dividida em sub-redes /24 públicas e privadas.
Parte 2: tabelas de rota de cada sub-rede, com a regra do prefixo mais longo.
Parte 3: traceroute simulado. Cada roteador decrementa o TTL; quando chega a zero,
  o roteador descarta o pacote e responde com ICMP "time exceeded" à origem.
Parte 4: grupo de segurança (com estado) e ACL de rede (sem estado).
"""
import ipaddress

VPC = ipaddress.ip_network("10.0.0.0/16")
SUBREDES = list(VPC.subnets(new_prefix=24))
PUBLICAS = {"zona-a": SUBREDES[0], "zona-b": SUBREDES[1]}
PRIVADAS = {"zona-a": SUBREDES[10], "zona-b": SUBREDES[11]}

# Rotas: "local" para a própria VPC; a rota padrão aponta para o gateway da internet
# (sub-redes públicas) ou para o gateway NAT (sub-redes privadas).
TABELA_PUBLICA = [("10.0.0.0/16", "local"), ("0.0.0.0/0", "gateway-internet")]
TABELA_PRIVADA = [("10.0.0.0/16", "local"), ("0.0.0.0/0", "nat-gateway")]


def roteia(tabela, destino):
    """Escolhe a rota de maior prefixo que contém o destino."""
    ip = ipaddress.ip_address(destino)
    candidatas = [(ipaddress.ip_network(r), alvo) for r, alvo in tabela if ip in ipaddress.ip_network(r)]
    rede, alvo = max(candidatas, key=lambda c: c[0].prefixlen)
    return str(rede), alvo


def traceroute(origem, destino, caminho, ttl_max=6):
    """Envia pacotes com TTL 1, 2, 3...; cada roteador do caminho decrementa o TTL."""
    print(f"  traceroute de {origem} para {destino}")
    for ttl in range(1, ttl_max + 1):
        if ttl > len(caminho):
            print(f"  {ttl:>2}  sem resposta")
            break
        salto = caminho[ttl - 1]
        if salto == destino:
            print(f"  {ttl:>2}  {salto}  echo reply: o destino respondeu")
            break
        print(f"  {ttl:>2}  {salto}  time exceeded: TTL zerou no roteador")


def grupo_seguranca(entrada_permitida):
    """Grupo de segurança é stateful: se a entrada é permitida, a resposta do mesmo
    fluxo volta sem regra de saída adicional."""
    if not entrada_permitida:
        return "bloqueado na entrada"
    return "permitido; a resposta volta pelo estado da conexão"


def acl_rede(entrada_permitida, saida_permitida):
    """ACL de rede é stateless: a entrada e a saída são avaliadas separadamente,
    e a resposta de uma conexão precisa de regra própria na saída."""
    if not entrada_permitida:
        return "bloqueado na entrada"
    if not saida_permitida:
        return "entrada permitida, mas a resposta é bloqueada na saída"
    return "permitido nos dois sentidos"


if __name__ == "__main__":
    print("Parte 1: planejamento da VPC")
    print(f"  VPC {VPC}: {len(SUBREDES)} sub-redes /24 disponíveis, {VPC.num_addresses} endereços")
    for zona, rede in PUBLICAS.items():
        print(f"  pública  {zona}: {rede} ({rede.num_addresses - 5} endereços úteis, com 5 reservados pela AWS)")
    for zona, rede in PRIVADAS.items():
        print(f"  privada  {zona}: {rede}")

    print("\nParte 2: tabelas de rota")
    for destino in ("10.0.0.25", "10.0.200.9", "8.8.8.8"):
        print(f"  pública  -> {destino:<10} : {roteia(TABELA_PUBLICA, destino)}")
    for destino in ("10.0.0.25", "8.8.8.8"):
        print(f"  privada  -> {destino:<10} : {roteia(TABELA_PRIVADA, destino)}")

    print("\nParte 3: traceroute")
    caminho = ["10.0.0.1", "10.0.1.1", "172.16.5.1", "93.184.216.34"]
    traceroute("10.0.0.25", "93.184.216.34", caminho)

    print("\nParte 4: filtros")
    print(f"  grupo de segurança, entrada permitida: {grupo_seguranca(True)}")
    print(f"  ACL, entrada permitida e saída sem regra: {acl_rede(True, False)}")
    print(f"  ACL, entrada e saída permitidas: {acl_rede(True, True)}")
