"""Segurança de redes: troca de chaves, integridade e firewall.

Parte 1: Diffie-Hellman com números pequenos. Os dois lados chegam à mesma chave
  secreta sem nunca transmiti-la. Com p pequeno é inseguro de propósito: serve só
  para entender a álgebra. Em uso real, p tem 2048 bits ou mais (ou usa-se ECDH).
Parte 2: integridade com HMAC (biblioteca padrão). Uma alteração no conteúdo é
  detectada. HMAC protege contra alteração, mas não esconde o conteúdo: para isso,
  é preciso cifrar.
Parte 3: firewall com regras avaliadas da primeira para a última (primeira correspondência).
"""
import hashlib
import hmac

P, G = 23, 5  # primo e gerador públicos (pequenos, só para ilustrar)


def dh_par(privada):
    return pow(G, privada, P)


def chave_compartilhada(publica_outra, privada):
    return pow(publica_outra, privada, P)


def etiqueta(chave: bytes, mensagem: bytes) -> str:
    return hmac.new(chave, mensagem, hashlib.sha256).hexdigest()[:16]


def verifica(chave: bytes, mensagem: bytes, tag: str) -> bool:
    return hmac.compare_digest(etiqueta(chave, mensagem), tag)


REGRAS = [  # (ação, protocolo, porta de destino)
    ("permitir", "tcp", 443),   # HTTPS
    ("permitir", "tcp", 22),    # SSH (ideal: só de uma rede de administração)
    ("negar", "tcp", 23),       # Telnet: texto puro
    ("permitir", "udp", 53),    # DNS
]
POLITICA_PADRAO = "negar"


def decide(protocolo, porta):
    for acao, proto, p in REGRAS:
        if proto == protocolo and p == porta:
            return acao
    return POLITICA_PADRAO


if __name__ == "__main__":
    print("Parte 1: Diffie-Hellman")
    a_priv, b_priv = 6, 15  # privadas: nunca saem de cada lado
    A, B = dh_par(a_priv), dh_par(b_priv)
    print(f"  públicas trocadas: A = {A}, B = {B}")
    k_alice = chave_compartilhada(B, a_priv)
    k_bob = chave_compartilhada(A, b_priv)
    print(f"  chave calculada por Alice: {k_alice}")
    print(f"  chave calculada por Bob:   {k_bob}")
    print(f"  iguais: {k_alice == k_bob}")

    print("\nParte 2: integridade com HMAC")
    chave = str(k_alice).encode()
    msg = b"transferir 100 para conta 42"
    tag = etiqueta(chave, msg)
    print(f"  mensagem original, tag {tag}: verificada = {verifica(chave, msg, tag)}")
    alterada = b"transferir 900 para conta 42"
    print(f"  mensagem alterada, mesma tag: verificada = {verifica(chave, alterada, tag)}")
    print(f"  sem a chave, o atacante não gera a tag correta para a nova mensagem")

    print("\nParte 3: firewall, primeira correspondência")
    pedidos = [("tcp", 443), ("tcp", 23), ("udp", 53), ("tcp", 3389), ("udp", 123)]
    for proto, porta in pedidos:
        print(f"  {proto}/{porta:<5} -> {decide(proto, porta)}")
