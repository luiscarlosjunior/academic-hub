"""Teste de mutação didático: a cobertura não basta, é preciso saber se os
testes detectam alterações de comportamento.

Uma 'mutação' é uma cópia do código com um pequeno defeito artificial.
Um mutante é 'morto' se algum teste falha; 'sobrevivente' se todos passam.
"""

ORIGINAL = """
def percentual_desconto(valor):
    return 5 if valor >= 100 else 0
"""

MUTANTES = {
    "troca >= por >":          "return 5 if valor > 100 else 0",
    "limite 100 para 99":      "return 5 if valor >= 99 else 0",
    "troca 5 por 4":           "return 4 if valor >= 100 else 0",
    "inverte o resultado":     "return 0 if valor >= 100 else 5",
}

def executa(codigo):
    espaco = {}
    exec(codigo, espaco)
    return espaco["percentual_desconto"]

def suite(f):
    """Suíte de testes em forma de casos (entrada, esperado)."""
    casos = [(50, 0), (250, 5), (99.99, 0), (100.01, 5)]
    return all(f(v) == e for v, e in casos)

def suite_reforcada(f):
    casos = [(50, 0), (250, 5), (99.99, 0), (100.00, 5), (100.01, 5)]
    return all(f(v) == e for v, e in casos)

for nome_suite, teste in [("suíte inicial", suite), ("suíte com valor-limite", suite_reforcada)]:
    mortos, sobreviventes = [], []
    for nome, trecho in MUTANTES.items():
        cod = ORIGINAL.replace("return 5 if valor >= 100 else 0", trecho)
        ok_original = teste(executa(ORIGINAL))
        ok_mutante = teste(executa(cod))
        (sobreviventes if ok_mutante == ok_original else mortos).append(nome)
    print(f"{nome_suite}: {len(mortos)}/{len(MUTANTES)} mutantes mortos")
    print("  sobreviventes:", sobreviventes or "nenhum")
