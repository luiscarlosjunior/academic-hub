"""Validação na borda: coletar todos os erros de entrada de uma vez.

A validação verifica a forma dos dados (tipos, obrigatoriedade, faixas) e
devolve uma lista de problemas com o campo e a regra violada. A regra de
negócio (ex.: estoque suficiente) fica fora desta camada.
"""

def valida_pedido(dados):
    erros = []
    if not isinstance(dados.get("cliente_id"), int):
        erros.append(("cliente_id", "deve ser um inteiro"))
    qtd = dados.get("quantidade")
    if qtd is None:
        erros.append(("quantidade", "é obrigatória"))
    elif not isinstance(qtd, int) or qtd <= 0:
        erros.append(("quantidade", "deve ser um inteiro maior que zero"))
    if dados.get("email", "").count("@") != 1:
        erros.append(("email", "formato inválido"))
    return erros

casos = {
    "válido": {"cliente_id": 7, "quantidade": 2, "email": "ana@exemplo.com"},
    "vários erros": {"cliente_id": "7", "quantidade": -1, "email": "ana.exemplo.com"},
    "faltando campo": {"cliente_id": 7, "email": "ana@exemplo.com"},
}

for nome, dados in casos.items():
    erros = valida_pedido(dados)
    estado = "aceito" if not erros else f"rejeitado com {len(erros)} erro(s)"
    print(f"{nome}: {estado}")
    for campo, regra in erros:
        print(f"    - {campo}: {regra}")
