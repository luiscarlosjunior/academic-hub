"""CDN e borda: cache LRU com TTL, popularidade de conteúdo e latência.

Parte 1: pedidos seguem uma distribuição de cauda pesada (Zipf): poucos conteúdos
  concentram a maioria dos acessos. Um cache LRU na borda absorve esses acessos.
Parte 2: taxa de acerto em função do tamanho do cache.
Parte 3: efeito do TTL: conteúdo expirado obriga nova busca na origem.
Parte 4: latência média: o acerto na borda evita a viagem até a origem.
"""
import bisect
import random
from collections import OrderedDict

N_CONTEUDOS = 1000
S_ZIPF = 1.0
random.seed(7)  # reprodutível


def gera_pedidos(n):
    pesos = [1 / (k ** S_ZIPF) for k in range(1, N_CONTEUDOS + 1)]
    acumulado = []
    total = 0.0
    for p in pesos:
        total += p
        acumulado.append(total)
    pedidos = []
    for _ in range(n):
        r = random.random() * total
        pedidos.append(bisect.bisect(acumulado, r) + 1)
    return pedidos


class CacheLRU:
    def __init__(self, capacidade, ttl=None):
        self.capacidade = capacidade
        self.ttl = ttl
        self.dados = OrderedDict()  # id -> instante em que foi guardado

    def pede(self, obj, agora):
        """Retorna True se foi acerto (conteúdo válido no cache)."""
        if obj in self.dados:
            guardado = self.dados[obj]
            if self.ttl is None or agora - guardado < self.ttl:
                self.dados.move_to_end(obj)
                return True
            del self.dados[obj]  # expirado: sai do cache
        self.dados[obj] = agora
        if len(self.dados) > self.capacidade:
            self.dados.popitem(last=False)
        return False


def taxa_acerto(pedidos, capacidade, ttl=None, passo=1):
    cache = CacheLRU(capacidade, ttl)
    acertos = 0
    for i, obj in enumerate(pedidos):
        if cache.pede(obj, i * passo):
            acertos += 1
    return acertos / len(pedidos)


if __name__ == "__main__":
    pedidos = gera_pedidos(20000)
    top10 = sum(1 for p in pedidos if p <= 10) / len(pedidos)
    print(f"Parte 1: {len(pedidos)} pedidos, {N_CONTEUDOS} conteúdos (Zipf s={S_ZIPF})")
    print(f"  os 10 conteúdos mais populares recebem {100 * top10:.1f}% dos pedidos")

    print("\nParte 2: taxa de acerto por tamanho do cache (sem TTL)")
    for cap in (10, 50, 100, 300):
        print(f"  cache de {cap:>3} conteúdos: acerto {100 * taxa_acerto(pedidos, cap):.1f}%")

    print("\nParte 3: efeito do TTL (cache de 100 conteúdos, 1 pedido por unidade de tempo)")
    for ttl in (None, 5000, 1000, 200):
        rotulo = "sem TTL" if ttl is None else f"TTL {ttl}"
        print(f"  {rotulo:<10}: acerto {100 * taxa_acerto(pedidos, 100, ttl):.1f}%")

    print("\nParte 4: latência média (borda a 10 ms do usuário, origem a 120 ms da borda)")
    acerto = taxa_acerto(pedidos, 100)
    lat_borda, lat_origem = 10, 120
    media = acerto * lat_borda + (1 - acerto) * (lat_borda + lat_origem)
    print(f"  com cache: {media:.1f} ms; sem CDN (sempre na origem): {lat_borda + lat_origem} ms")
    print(f"  carga na origem reduzida para {100 * (1 - acerto):.1f}% dos pedidos")
