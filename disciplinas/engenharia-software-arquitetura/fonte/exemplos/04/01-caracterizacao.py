"""Teste de caracterização: antes de refatorar, fixe o comportamento atual.

Versão legada: um condicional em cascata com regra duplicada.
Versão refatorada: tabela de dados e uma única função. A equivalência é
verificada sobre uma malha de entradas, e não apenas sobre alguns casos.
"""

def total_legado(itens, tipo):
    total = 0
    for preco, qtd in itens:
        total += preco * qtd
    if tipo == "vip":
        total = total * 0.9
    elif tipo == "atacado":
        total = total * 0.8
    return round(total, 2)

DESCONTO = {"vip": 0.10, "atacado": 0.20}

def subtotal(itens):
    return sum(preco * qtd for preco, qtd in itens)

def total_refatorado(itens, tipo):
    return round(subtotal(itens) * (1 - DESCONTO.get(tipo, 0)), 2)

# Malha de entradas: preços, quantidades e tipos de cliente
precos = [0, 0.5, 9.99, 100]
quantidades = [0, 1, 3]
tipos = ["comum", "vip", "atacado", "desconhecido"]

casos = 0
divergencias = []
for p in precos:
    for q in quantidades:
        for t in tipos:
            itens = [(p, q), (1.25, 2)]
            casos += 1
            if total_legado(itens, t) != total_refatorado(itens, t):
                divergencias.append((itens, t))

print(f"casos verificados: {casos}")
print(f"divergências: {len(divergencias)}")
print("exemplo de resultado:", total_refatorado([(9.99, 3), (1.25, 2)], "vip"))
