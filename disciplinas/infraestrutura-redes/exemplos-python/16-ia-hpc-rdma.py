"""Redes para treinamento de IA e HPC: all-reduce em anel e custo de comunicação.

Parte 1: all-reduce em anel com N trabalhadores (GPUs). Cada um soma sua parte
  com a do vizinho em N-1 passos (reduce-scatter) e depois distribui o resultado
  em mais N-1 passos (all-gather). Verificamos o resultado contra a soma direta.
Parte 2: volume transferido por trabalhador: 2 (N-1)/N vezes o tamanho do gradiente.
  Essa quantidade quase não cresce com N, por isso o anel escala bem.
Parte 3: tempo estimado por passo, em função da banda e da latência da rede.
"""

N = 4
TAMANHO = 8  # elementos do gradiente, divisível por N


def ring_all_reduce(gradientes):
    n = len(gradientes)
    tam = len(gradientes[0])
    parte = tam // n
    dados = [list(g) for g in gradientes]
    enviados = 0

    def fatia(k):
        return range(k * parte, (k + 1) * parte)

    # reduce-scatter: após N-1 passos, o trabalhador i tem a soma completa da fatia (i+1) % n
    for passo in range(n - 1):
        novos = [list(d) for d in dados]
        for i in range(n):
            k = (i - passo) % n
            destino = (i + 1) % n
            for idx in fatia(k):
                novos[destino][idx] += dados[i][idx]
            enviados += parte
        dados = novos
    # all-gather: cada trabalhador repassa a fatia completa que tem
    for passo in range(n - 1):
        novos = [list(d) for d in dados]
        for i in range(n):
            k = (i + 1 - passo) % n
            destino = (i + 1) % n
            for idx in fatia(k):
                novos[destino][idx] = dados[i][idx]
            enviados += parte
        dados = novos
    return dados, enviados // n  # elementos enviados por trabalhador


def tempo_passo_us(bytes_, banda_gbps, latencia_us):
    return latencia_us + bytes_ * 8 / (banda_gbps * 1e3)


if __name__ == "__main__":
    print(f"Parte 1: all-reduce em anel com {N} trabalhadores, gradiente de {TAMANHO} elementos")
    grads = [[(i + 1) * 10 + j for j in range(TAMANHO)] for i in range(N)]
    soma = [sum(g[j] for g in grads) for j in range(TAMANHO)]
    resultado, enviados = ring_all_reduce(grads)
    ok = all(r == soma for r in resultado)
    print(f"  soma direta:      {soma}")
    print(f"  trabalhador 0:    {resultado[0]}")
    print(f"  todos iguais à soma: {ok}")

    print("\nParte 2: volume transferido por trabalhador (em múltiplos do gradiente)")
    for n in (2, 4, 8, 64, 1024):
        fator = 2 * (n - 1) / n
        print(f"  N = {n:>4}: {fator:.3f} x tamanho do gradiente")
    print(f"  simulado com N = {N}: {enviados} elementos enviados por trabalhador, "
          f"de {TAMANHO}: {enviados / TAMANHO:.3f} x")

    print("\nParte 3: tempo por passo (latência 2 us, enlace de 400 Gb/s)")
    bytes_fatia = (TAMANHO // N) * 4  # float32
    t = tempo_passo_us(bytes_fatia, 400, 2)
    print(f"  fatia de {bytes_fatia} bytes: {t:.3f} us por passo; passos totais: {2 * (N - 1)}")
    grad_grande = 1 * 2**30  # 1 GiB de gradiente
    for n in (8, 64):
        vol = 2 * (n - 1) / n * grad_grande
        tempo_ms = vol * 8 / (400e9) * 1e3
        print(f"  gradiente de 1 GiB, N = {n}: {vol / 2**30:.2f} GiB por trabalhador, "
              f"~{tempo_ms:.1f} ms na banda ideal")
