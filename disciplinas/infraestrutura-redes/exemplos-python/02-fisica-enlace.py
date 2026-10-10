"""Detecção de erro com CRC-32 e utilização de janelas deslizantes.

Parte 1: o FCS da Ethernet é um CRC-32. zlib.crc32 usa o mesmo polinômio, então
o comportamento aqui é o do quadro real: uma inversão de bit é sempre detectada.
Parte 2: utilização do enlace com parar-e-esperar e com janela deslizante.
"""
import zlib


def monta_quadro(dados: bytes) -> bytes:
    """Acrescenta o FCS (4 bytes, big-endian) ao fim do quadro."""
    return dados + zlib.crc32(dados).to_bytes(4, "big")


def quadro_valido(quadro: bytes) -> bool:
    dados, fcs = quadro[:-4], int.from_bytes(quadro[-4:], "big")
    return zlib.crc32(dados) == fcs


def inverte_bit(quadro: bytes, posicao: int) -> bytes:
    """Simula um erro: inverte o bit na posição indicada (contada a partir de 0)."""
    byte, bit = divmod(posicao, 8)
    lista = bytearray(quadro)
    lista[byte] ^= 1 << (7 - bit)
    return bytes(lista)


def utilizacao_parar_esperar(a: float) -> float:
    """U = 1 / (1 + 2a), com a = tempo de propagação / tempo de transmissão."""
    return 1 / (1 + 2 * a)


def utilizacao_janela(n: int, a: float) -> float:
    """Janela de n quadros: U = min(1, n / (1 + 2a))."""
    return min(1.0, n / (1 + 2 * a))


if __name__ == "__main__":
    print("Parte 1: detecção de erro com CRC-32")
    quadro = monta_quadro(b"Hello, rede! Este e um quadro de teste.")
    print(f"  quadro com FCS: {len(quadro)} bytes, FCS = {quadro[-4:].hex()}")
    print(f"  sem erro: valido = {quadro_valido(quadro)}")
    for pos in (0, 100, len(quadro) * 8 - 1):
        ruim = inverte_bit(quadro, pos)
        print(f"  bit {pos:>3} invertido: valido = {quadro_valido(ruim)}")

    print("\nParte 2: utilização do enlace (a = propagação / transmissão = 5)")
    a = 5.0
    print(f"  parar-e-esperar       U = {utilizacao_parar_esperar(a):.4f}")
    for n in (1, 3, 7, 11, 15):
        print(f"  janela n = {n:>2}        U = {utilizacao_janela(n, a):.4f}")
    print(f"  janela mínima para U = 1: n >= 1 + 2a = {1 + 2 * a:.0f}")
