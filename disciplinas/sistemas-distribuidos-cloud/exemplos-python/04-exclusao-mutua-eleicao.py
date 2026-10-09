"""
Tópico 4 · Eleição em anel (Chang e Roberts) e exclusão mútua com token.
Execute com: python3 04-exclusao-mutua-eleicao.py
"""


def chang_roberts(ids):
    """Eleição em anel. Cada nó envia o próprio id no sentido horário.

    Devolve (índice do líder, mensagens por rodada, total de mensagens).
    A regra: id recebido maior que o próprio é repassado; menor é descartado;
    igual ao próprio elege o nó, porque o id deu a volta completa.
    """
    n = len(ids)
    msgs = [(i, (i + 1) % n, ids[i]) for i in range(n)]  # (de, para, id)
    rodadas = []
    total = 0
    lider = None
    while msgs and lider is None:
        rodadas.append(list(msgs))
        total += len(msgs)
        prox = []
        for de, para, id_msg in msgs:
            if id_msg == ids[para]:
                lider = para
            elif id_msg > ids[para]:
                prox.append((para, (para + 1) % n, id_msg))
        msgs = prox
    return lider, rodadas, total


def exclusao_mutua_token(n, pedidos_por_rodada):
    """Exclusão mútua com token em anel. O token avança uma posição por rodada.

    pedidos_por_rodada[r] = conjunto de nós que pedem a seção crítica na rodada r.
    Só entra quem tem o token e está pedindo; sai antes de repassar o token.
    Devolve a lista de entradas (rodada, nó, rodadas de espera).
    """
    pendentes = set()
    inicio_espera = {}
    entradas = []
    token = 0
    for r, pedidos in enumerate(pedidos_por_rodada):
        for p in pedidos:
            pendentes.add(p)
            inicio_espera.setdefault(p, r)
        if token in pendentes:                # o nó com o token entra e sai
            pendentes.discard(token)
            entradas.append((r, token, r - inicio_espera.pop(token)))
        token = (token + 1) % n               # o token segue para o vizinho
    print(f"  aguardando ao fim: {sorted(pendentes)}")
    return entradas


if __name__ == "__main__":
    print("--- Eleição em anel: ids no sentido horário ---")
    ids = [3, 7, 1, 5, 2]
    lider, rodadas, total = chang_roberts(ids)
    for k, msgs in enumerate(rodadas, start=1):
        print(f"  rodada {k}: " + ", ".join(f"{idm}(nó {de}->{para})" for de, para, idm in msgs))
    print(f"  líder: nó {lider} com id {ids[lider]}")
    print(f"  total de mensagens: {total}")

    print("\n--- Pior caso: ids em ordem decrescente ---")
    for n in (4, 8, 16):
        pior = list(range(n, 0, -1))
        _, _, total_pior = chang_roberts(pior)
        print(f"  n = {n:2d}: {total_pior} mensagens")

    print("\n--- Exclusão mútua com token (4 nós) ---")
    cenario = [{1}, {1, 3}, set(), {3}, {0, 2}, set(), set()]
    entradas = exclusao_mutua_token(4, cenario)
    print("  entradas (rodada, nó, rodadas de espera):")
    for r, p, espera in entradas:
        print(f"    rodada {r}: P{p} entrou após {espera} rodada(s)")
