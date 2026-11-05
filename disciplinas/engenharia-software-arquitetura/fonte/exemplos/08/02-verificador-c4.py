"""Verificador de consistência de um modelo C4 (contexto, contêineres, componentes).

Um modelo é um dicionário de elementos com relações. O verificador confere:
(1) toda relação aponta para elementos existentes; (2) todo contêiner tem
descrição e tecnologia; (3) elementos órfãos (sem relação) são listados.
Trata-se de uma verificação de consistência, não de correção do desenho.
"""

modelo = {
    "elementos": {
        "Aluno":        {"nivel": "pessoa"},
        "Portal":       {"nivel": "contêiner", "tecnologia": "React", "descricao": "interface web"},
        "API":          {"nivel": "contêiner", "tecnologia": "Python", "descricao": "regras de matrícula"},
        "BancoMatric":  {"nivel": "contêiner", "tecnologia": "PostgreSQL", "descricao": "matrículas"},
        "ServicoEmail": {"nivel": "sistema externo"},
        "Relatorios":   {"nivel": "contêiner"},            # falta tecnologia e descrição
    },
    "relacoes": [
        ("Aluno", "Portal", "usa"),
        ("Portal", "API", "chama"),
        ("API", "BancoMatric", "lê e grava"),
        ("API", "ServicoEmail", "envia confirmação"),
        ("API", "Cobranca", "consulta"),            # 'Cobranca' não existe
    ],
}

els, rels = modelo["elementos"], modelo["relacoes"]
erros = []
for origem, destino, _ in rels:
    for ponta in (origem, destino):
        if ponta not in els:
            erros.append(f"relação '{origem} -> {destino}' cita '{ponta}', que não existe")

for nome, dados in els.items():
    if dados["nivel"] == "contêiner":
        faltando = [c for c in ("tecnologia", "descricao") if c not in dados]
        if faltando:
            erros.append(f"contêiner '{nome}' sem: {', '.join(faltando)}")

usados = {x for o, d, _ in rels for x in (o, d)}
orfaos = sorted(n for n in els if n not in usados)

print(f"elementos: {len(els)}, relações: {len(rels)}")
print("erros de consistência:")
for e in erros:
    print("  -", e)
print("elementos órfãos:", orfaos or "nenhum")
