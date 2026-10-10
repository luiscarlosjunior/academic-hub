"""Observabilidade de rede: percentis, orçamento de erro (SLO) e detecção de anomalia.

Parte 1: a média esconde a cauda. Latências com uma minoria de picos, medidas
  por um agente, mostram média baixa e p99 muito maior.
Parte 2: orçamento de erro de um SLO de disponibilidade de 99,9% em 30 dias.
Parte 3: fluxos (estilo IPFIX) agregados por origem e uma detecção de anomalia
  com média móvel exponencial (EWMA): um pico de tráfego dispara o alerta.
"""
import random
from collections import Counter

random.seed(11)  # reprodutível


def percentil(valores, p):
    ordenados = sorted(valores)
    k = max(0, min(len(ordenados) - 1, round(p / 100 * (len(ordenados) - 1))))
    return ordenados[k]


def orcamento_erro_minutos(slo, dias):
    return (1 - slo) * dias * 24 * 60


if __name__ == "__main__":
    print("Parte 1: média versus percentis (2000 medições de latência, em ms)")
    lat = []
    for i in range(2000):
        base = 20 + random.expovariate(1 / 8)
        lat.append(base + (200 if i % 97 == 0 else 0))  # 1 em cada 97 requisições passa por pico
    media = sum(lat) / len(lat)
    print(f"  média: {media:.1f} ms")
    for p in (50, 95, 99):
        print(f"  p{p}: {percentil(lat, p):.1f} ms")
    print(f"  pior medição: {max(lat):.1f} ms")

    print("\nParte 2: orçamento de erro de um SLO")
    orc = orcamento_erro_minutos(0.999, 30)
    print(f"  SLO 99,9% em 30 dias: orçamento de {orc:.1f} minutos de indisponibilidade")
    incidente = 20
    print(f"  um incidente de {incidente} min consome {100 * incidente / orc:.0f}% do orçamento")

    print("\nParte 3: fluxos por origem e detecção de anomalia")
    fluxos = []
    origens = ["10.0.1.5", "10.0.1.9", "10.0.2.7", "10.0.3.3"]
    for minuto in range(30):
        base = {o: random.randint(200, 800) for o in origens}
        if minuto == 22:  # pico anômalo de 10.0.2.7
            base["10.0.2.7"] *= 12
        for o in origens:
            fluxos.append((minuto, o, base[o]))
    total_por_origem = Counter()
    for _, o, bytes_ in fluxos:
        total_por_origem[o] += bytes_
    print("  maiores origens (bytes, 30 min):")
    for o, b in total_por_origem.most_common(4):
        print(f"    {o:<10} {b}")

    alfa = 0.2
    media_movel = None
    print("  alertas (EWMA, limiar de 1,5 vez a média):")
    for minuto in range(30):
        total = sum(b for m, _, b in fluxos if m == minuto)
        if media_movel is None:
            media_movel = total
            continue
        if total > 1.5 * media_movel:
            print(f"    minuto {minuto}: {total} bytes, média móvel {media_movel:.0f}: ALERTA")
        media_movel = alfa * total + (1 - alfa) * media_movel
