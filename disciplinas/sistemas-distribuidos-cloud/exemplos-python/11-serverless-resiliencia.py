"""
Tópico 11 · Padrões de resiliência: disjuntor e reenvio com backoff e jitter.
Execute com: python3 11-serverless-resiliencia.py
"""
import random


class Disjuntor:
    """Três estados: fechado (chamadas passam), aberto (rejeita na hora) e meio-aberto (um teste decide)."""

    def __init__(self, limite=3, espera=4):
        self.limite = limite
        self.espera = espera
        self.estado = "fechado"
        self.falhas = 0
        self.abriu_em = None

    def chama(self, t, servico_ok):
        """Devolve 'rejeitada', 'ok' ou 'falha'. Só chamadas aceitas chegam ao serviço."""
        if self.estado == "aberto":
            if t - self.abriu_em >= self.espera:
                self.estado = "meio-aberto"
            else:
                return "rejeitada"
        if self.estado == "meio-aberto":
            if servico_ok:
                self.estado, self.falhas = "fechado", 0
                return "ok"
            self.estado, self.abriu_em = "aberto", t
            return "falha"
        if servico_ok:
            self.falhas = 0
            return "ok"
        self.falhas += 1
        if self.falhas >= self.limite:
            self.estado, self.abriu_em = "aberto", t
        return "falha"


def simula_disjuntor():
    """Serviço fora do ar entre os instantes 4 e 12. Um pedido por instante."""
    disj = Disjuntor()
    chegaram = 0
    linha = []
    for t in range(20):
        servico_ok = not (4 <= t <= 12)
        resultado = disj.chama(t, servico_ok)
        if resultado != "rejeitada":
            chegaram += 1
        linha.append(f"{t:2d}:{disj.estado[:4]}/{resultado[:4]}")
    print("  instante:estado/resultado")
    for i in range(0, len(linha), 5):
        print("  " + "  ".join(linha[i:i + 5]))
    print(f"  pedidos que chegaram ao serviço: {chegaram} de 20")


def simula_reenvio(jitter, clientes=1000, capacidade=200, recuperacao=10, semente=2):
    """Mil clientes falham quando o serviço cai, e reenviam com backoff exponencial.

    Sem jitter, todos com o mesmo número de tentativas reenviam no mesmo instante.
    Com jitter total, o reenvio é sorteado em [0, espera], e se espalha no tempo.
    """
    rng = random.Random(semente)
    proxima = [0] * clientes     # instante do próximo envio de cada cliente
    tentativas = [0] * clientes
    concluidos = [False] * clientes
    pico = 0
    t = 0
    ultimo_concluido = 0
    while not all(concluidos) and t < 500:
        tentando = [i for i in range(clientes) if not concluidos[i] and proxima[i] == t]
        if t > 0:                             # a primeira onda é comum às duas políticas
            pico = max(pico, len(tentando))
        aceitos = tentando[:capacidade] if t >= recuperacao else []
        for i in aceitos:
            concluidos[i] = True
            ultimo_concluido = t
        for i in tentando:
            if concluidos[i]:
                continue
            tentativas[i] += 1
            espera = min(8 * 2 ** tentativas[i], 256)   # backoff exponencial com base 8
            proxima[i] = t + (rng.randint(1, espera) if jitter else espera)
        t += 1
    return pico, ultimo_concluido


if __name__ == "__main__":
    print("Disjuntor: serviço fora do ar entre os instantes 4 e 12")
    simula_disjuntor()

    print("\nReenvio de 1000 clientes após uma queda de 10 instantes (capacidade 200 por instante):")
    for jitter in (False, True):
        pico, fim = simula_reenvio(jitter)
        rotulo = "com jitter total" if jitter else "sem jitter"
        print(f"  {rotulo:<18} pico de chamadas em um instante: {pico:4d}   todos atendidos no instante: {fim}")
