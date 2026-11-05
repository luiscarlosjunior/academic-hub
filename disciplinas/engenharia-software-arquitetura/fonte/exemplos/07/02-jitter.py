"""Por que o jitter importa: retentativas sincronizadas criam ondas de carga.

N clientes falham no mesmo instante e fazem até TENTATIVAS retentativas com
backoff exponencial (teto = 2^k). Sem jitter, cada retentativa cai no teto
exato. Com jitter total, o intervalo é sorteado entre 0 e o teto.

Métrica: para cada janela de tempo de largura JANELA, conta-se quantos
clientes DISTINTOS fazem uma retentativa nela. O pico é o maior valor.
"""
import random

random.seed(11)
N = 200
JANELA = 0.25
TENTATIVAS = 4

def tempos_de_retentativa(com_jitter):
    t, out = 0.0, []
    for k in range(TENTATIVAS):
        teto = 2 ** k
        t += random.uniform(0, teto) if com_jitter else teto
        out.append(t)
    return out

def pico(com_jitter):
    janelas = {}
    for cliente in range(N):
        for t in tempos_de_retentativa(com_jitter):
            janelas.setdefault(int(t // JANELA), set()).add(cliente)
    return max(len(c) for c in janelas.values())

p_sem = pico(False)
p_com = pico(True)
print(f"clientes: {N}, retentativas por cliente: {TENTATIVAS}, janela: {JANELA}")
print(f"pico de clientes distintos retentando na mesma janela, sem jitter: {p_sem}")
print(f"pico de clientes distintos retentando na mesma janela, com jitter: {p_com}")
print(f"redução do pico: {100 * (1 - p_com / p_sem):.0f}%")
