"""Roteamento: vetor de distância (Bellman-Ford distribuído) e estado de enlace (Dijkstra).

Rede de quatro roteadores A, B, C e D. O destino é D, ligado diretamente a A.
Parte 1: vetor de distância, em rodadas síncronas, até convergir.
Parte 2: a falha do enlace A-D, com contagem ao infinito (INF = 16, como no RIP).
Parte 3: estado de enlace: cada roteador conhece o grafo inteiro e roda Dijkstra.
"""
import heapq

INF = 16  # distância considerada infinita, como no RIP
NOS = ["A", "B", "C", "D"]
ENLACES = {("A", "B"): 1, ("B", "C"): 1, ("A", "C"): 1, ("A", "D"): 1}


def custo(x, y):
    return ENLACES.get((x, y), ENLACES.get((y, x)))


def vizinhos(x, ativos):
    """Vizinhos de x ligados por enlaces ativos, em ordem alfabética."""
    saida = []
    for (a, b) in ativos:
        if a == x:
            saida.append(b)
        elif b == x:
            saida.append(a)
    return sorted(saida)


def passo(dist, ativos):
    """Uma rodada síncrona: cada nó recalcula a distância com base no que os vizinhos
    anunciaram na rodada anterior. Retorna novas distâncias e o vizinho escolhido."""
    novo, via = {}, {}
    for x in NOS:
        if x == "D":
            novo[x], via[x] = 0, "-"
            continue
        melhor, escolha = INF, None
        for y in vizinhos(x, ativos):
            c = custo(x, y) + dist[y]
            if c < melhor:
                melhor, escolha = c, y
        novo[x] = min(melhor, INF)
        via[x] = escolha if novo[x] < INF else "-"
    return novo, via


def vetor_distancia(ativos, rodadas_max=20, falha=None, rodada_falha=None):
    """Roda o vetor de distância até estabilizar. Se falha for informada, remove esse
    enlace na rodada indicada, e a contagem ao infinito pode aparecer."""
    dist = {x: INF for x in NOS}
    dist["D"] = 0
    for (a, b) in ativos:
        if b == "D":
            dist[a] = custo(a, b)
    historico = [(0, dict(dist), {x: "-" for x in NOS})]
    for r in range(1, rodadas_max + 1):
        if falha and r == rodada_falha:
            ativos = [e for e in ativos if e != falha]
        novo, via = passo(dist, ativos)
        historico.append((r, novo, via))
        if novo == dist and not (falha and r <= rodada_falha):
            break
        dist = novo
    return historico


def imprime(historico, titulo):
    print(titulo)
    for r, dist, via in historico:
        linha = "  ".join(
            f"{x}={dist[x]:>2} via {via[x]}" for x in ["A", "B", "C"]
        )
        print(f"  rodada {r:>2}: {linha}")


def dijkstra(origem, ativos):
    """Estado de enlace: caminho mínimo a partir de origem sobre o grafo completo."""
    dist = {x: float("inf") for x in NOS}
    prev = {x: None for x in NOS}
    dist[origem] = 0
    fila = [(0, origem)]
    while fila:
        d, x = heapq.heappop(fila)
        if d > dist[x]:
            continue
        for y in vizinhos(x, ativos):
            nd = d + custo(x, y)
            if nd < dist[y]:
                dist[y], prev[y] = nd, x
                heapq.heappush(fila, (nd, y))
    return dist, prev


if __name__ == "__main__":
    todos = list(ENLACES.keys())

    print("Parte 1: vetor de distância, convergência (destino D)")
    imprime(vetor_distancia(todos), "")

    print("\nParte 2: falha do enlace A-D na rodada 3 (contagem ao infinito)")
    imprime(vetor_distancia(todos, falha=("A", "D"), rodada_falha=3,
                            rodadas_max=12), "")

    print("\nParte 3: estado de enlace, Dijkstra a partir de A")
    dist, prev = dijkstra("A", todos)
    for x in NOS:
        caminho = [x]
        while prev[x] is not None:
            x = prev[x]
            caminho.append(x)
        print(f"  para {caminho[0]}: custo {dist[caminho[0]]}, caminho "
              f"{' -> '.join(reversed(caminho))}")
