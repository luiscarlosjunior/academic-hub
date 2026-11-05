"""Previsão de entrega a partir da velocidade histórica (Scrum).

Dados fictícios de 6 Sprints: pontos de história efetivamente concluídos.
A previsão usa a média móvel das últimas 3 Sprints, uma prática comum,
e a incerteza é estimada pela faixa observada (mínimo e máximo).
"""
from statistics import mean

concluidos = [21, 18, 25, 19, 23, 20]   # pontos por Sprint (fictício)
backlog_restante = 130                  # pontos ainda não entregues

media3 = mean(concluidos[-3:])
minimo, maximo = min(concluidos[-3:]), max(concluidos[-3:])
print("Velocidade por Sprint:", concluidos)
print(f"Média das últimas 3 Sprints: {media3:.1f} pontos")
print(f"Faixa observada nas últimas 3: {minimo}..{maximo}")

import math
for nome, v in [("pessimista", minimo), ("provável", media3), ("otimista", maximo)]:
    sprints = math.ceil(backlog_restante / v)
    print(f"  cenário {nome:<10} velocidade {v:>5.1f} -> {sprints} Sprints")
