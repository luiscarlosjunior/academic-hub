"""Encapsulamento de uma requisição HTTP pela pilha TCP/IP.

Simula o caminho de uma mensagem de aplicação até o quadro Ethernet e o caminho
de volta. Cada camada acrescenta um cabeçalho ao descer (encapsulamento) e o
remove ao subir (desencapsulamento). Não usa rede: só mostra tamanhos e nomes.
"""

# Tamanhos típicos dos cabeçalhos em bytes, sem opções.
TCP_CABECALHO = 20
IP_CABECALHO = 20
ETH_CABECALHO = 14
ETH_FCS = 4  # sequência de verificação de quadro, no fim do quadro

PORTA_ORIGEM = 51234
PORTA_DESTINO = 80
IP_ORIGEM = "192.168.0.10"
IP_DESTINO = "93.184.216.34"
MAC_ORIGEM = "3c:22:fb:01:02:03"
MAC_DESTINO = "00:1a:2b:3c:4d:5e"


def mensagem_http():
    return (
        "GET / HTTP/1.1\r\n"
        "Host: exemplo.com\r\n"
        "Connection: close\r\n"
        "\r\n"
    ).encode("ascii")


def desce_pilha(dado):
    """Envia: cada camada envolve o dado da camada de cima com seu cabeçalho."""
    print("Descendo a pilha (encapsulamento)")
    print(f"  Aplicação  mensagem : {len(dado):>4} bytes  HTTP GET")

    segmento = dado
    tcp = {"origem": PORTA_ORIGEM, "destino": PORTA_DESTINO}
    segmento_tam = len(segmento) + TCP_CABECALHO
    print(f"  Transporte segmento : {segmento_tam:>4} bytes  "
          f"TCP {tcp['origem']} -> {tcp['destino']}")

    pacote_tam = segmento_tam + IP_CABECALHO
    print(f"  Rede       pacote   : {pacote_tam:>4} bytes  "
          f"IPv4 {IP_ORIGEM} -> {IP_DESTINO}")

    quadro_tam = pacote_tam + ETH_CABECALHO + ETH_FCS
    print(f"  Enlace     quadro   : {quadro_tam:>4} bytes  "
          f"Ethernet {MAC_ORIGEM} -> {MAC_DESTINO}")

    sobrecarga = quadro_tam - len(dado)
    print(f"  Sobrecarga total: {sobrecarga} bytes para {len(dado)} de dados "
          f"({100 * sobrecarga / quadro_tam:.1f}% do quadro)")
    return quadro_tam


def sobe_pilha(quadro_tam, dados_tam):
    """Recebe: cada camada lê o próprio cabeçalho e entrega o resto para cima."""
    print("\nSubindo a pilha (desencapsulamento) no receptor")
    pacote_tam = quadro_tam - ETH_CABECALHO - ETH_FCS
    print(f"  Enlace     : confere o FCS, entrega o pacote de {pacote_tam} bytes ao IP")
    segmento_tam = pacote_tam - IP_CABECALHO
    print(f"  Rede       : lê o protocolo = TCP e entrega o segmento de {segmento_tam} bytes")
    dado_tam = segmento_tam - TCP_CABECALHO
    print(f"  Transporte : porta de destino {PORTA_DESTINO} = HTTP, entrega {dado_tam} bytes")
    print(f"  Aplicação  : recebe a mensagem de {dado_tam} bytes")
    assert dado_tam == dados_tam, "a mensagem voltou alterada"


if __name__ == "__main__":
    dado = mensagem_http()
    quadro = desce_pilha(dado)
    sobe_pilha(quadro, len(dado))
