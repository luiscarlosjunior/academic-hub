"""UDP e TCP: handshake, números de sequência, ACK cumulativo e recuperação de perda.

Simulação determinística, sem sockets. Mostra:
  - o handshake de três vias e o encerramento com FIN;
  - um arquivo de 2000 bytes em segmentos de 500 bytes, com o segmento de seq 601 perdido;
  - o receptor guarda os segmentos fora de ordem e confirma de forma cumulativa;
  - dois ACKs duplicados não bastam para retransmissão rápida (são necessários três),
    então o remetente espera o temporizador e reenvia só o primeiro não confirmado.
"""

MSS = 500


class Receptor:
    def __init__(self, isn):
        self.esperado = isn
        self.buffer = {}  # seq -> tamanho, para segmentos recebidos fora de ordem

    def recebe(self, seq, tamanho):
        if seq == self.esperado:
            self.esperado += tamanho
            # Segmentos guardados que agora são contíguos também entram
            while self.esperado in self.buffer:
                self.esperado += self.buffer.pop(self.esperado)
        elif seq > self.esperado:
            self.buffer[seq] = tamanho  # guarda: fora de ordem
        return self.esperado  # ACK cumulativo: "recebi tudo até aqui"


def udp_datagrama(payload: bytes):
    """UDP: cabeçalho fixo de 8 bytes, sem conexão, sem confirmação, sem reenvio."""
    return {"cabecalho": 8, "total": 8 + len(payload)}


def tcp_segmento(payload: bytes, opcoes: int = 0):
    """TCP: cabeçalho mínimo de 20 bytes, mais opções (por exemplo, 12 bytes de timestamp)."""
    return {"cabecalho": 20 + opcoes, "total": 20 + opcoes + len(payload)}


if __name__ == "__main__":
    print("Parte 1: handshake e encerramento")
    isn_c, isn_s = 100, 300
    print(f"  C -> S  SYN      seq={isn_c}                   CLOSED -> SYN_SENT")
    print(f"  S -> C  SYN-ACK  seq={isn_s} ack={isn_c + 1}              LISTEN -> SYN_RCVD")
    print(f"  C -> S  ACK      seq={isn_c + 1} ack={isn_s + 1}              ESTABLISHED nos dois lados")

    print("\nParte 2: transferência de 2000 bytes, segmento seq=601 perdido")
    dados = b"x" * 2000
    base = isn_c + 1  # primeiro byte de dados é 101
    segmentos = [(base + i, min(MSS, len(dados) - i)) for i in range(0, len(dados), MSS)]
    rx = Receptor(base)
    perdido = 601
    confirmados = []
    dup = 0
    ultimo_ack = None

    for seq, tam in segmentos:
        if seq == perdido:
            print(f"  C -> S  seq={seq:>4} len={tam}  PERDIDO no caminho")
            continue
        ack = rx.recebe(seq, tam)
        print(f"  C -> S  seq={seq:>4} len={tam}   S -> C  ack={ack}")
        if ack == ultimo_ack:
            dup += 1
        ultimo_ack = ack

    print(f"  ACKs duplicados recebidos pelo remetente: {dup}")
    print(f"  três são necessários para retransmissão rápida; com {dup}, espera o temporizador")
    print(f"  temporizador expira: C reenvia seq={perdido} len={MSS}")
    ack = rx.recebe(perdido, MSS)
    print(f"  S -> C  ack={ack}: o buffer entregou 601, 1101 e 1601 de uma vez")
    confirmado_total = ack - base
    print(f"  total confirmado: {confirmado_total} bytes de {len(dados)}")

    print("\nParte 3: encerramento com FIN")
    # Cada lado tem seu próprio espaço de sequência: o do servidor começa em isn_s + 1
    fim_c = ack
    seq_s = isn_s + 1
    print(f"  C -> S  FIN      seq={fim_c}           ESTABLISHED -> FIN_WAIT_1")
    print(f"  S -> C  ACK      ack={fim_c + 1}           CLOSE_WAIT")
    print(f"  S -> C  FIN      seq={seq_s}                LAST_ACK")
    print(f"  C -> S  ACK      ack={seq_s + 1}                TIME_WAIT (espera 2 x MSL)")

    print("\nParte 4: cabeçalhos")
    carga = b"x" * 100
    print(f"  UDP, 100 bytes de dados: {udp_datagrama(carga)}")
    print(f"  TCP, 100 bytes de dados: {tcp_segmento(carga)}")
    print(f"  TCP com timestamp (12 bytes de opção): {tcp_segmento(carga, opcoes=12)}")
