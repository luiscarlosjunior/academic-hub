"""Matriz de rastreabilidade: requisito -> teste -> código.

Mostra como detectar lacunas automaticamente: requisitos sem teste,
testes que não verificam nenhum requisito e código sem origem declarada.
Os dados são fictícios e representam um módulo de catálogo.
"""

requisitos = {
    "RF-01": "Listar produtos paginados",
    "RF-02": "Filtrar por faixa de preço",
    "RF-03": "Ordenar por avaliação",
    "RNF-01": "Resposta da busca em até 300 ms (p95)",
}

# requisito -> testes que o verificam
testes = {
    "RF-01": ["CT-01", "CT-02"],
    "RF-02": ["CT-03", "CT-04"],
    "RNF-01": [],                 # lacuna: nenhum teste
}

# teste -> função de código que ele exercita (ou None)
codigo = {
    "CT-01": "catalogo.listar",
    "CT-02": "catalogo.listar",
    "CT-03": "catalogo.filtrar_preco",
    "CT-04": None,                # lacuna: teste sem código identificado
    "CT-99": "catalogo.ordenar",  # órfão: não aparece em nenhum requisito
}

print("Cobertura por requisito:")
sem_teste = []
for rid, descricao in requisitos.items():
    ts = testes.get(rid, [])
    estado = "OK" if ts else "SEM TESTE"
    if not ts:
        sem_teste.append(rid)
    print(f"  {rid:<7} {estado:<10} {descricao} -> {ts}")

testes_mapeados = {t for lista in testes.values() for t in lista}
orfaos = sorted(set(codigo) - testes_mapeados)
sem_codigo = sorted(t for t, c in codigo.items() if c is None)

print()
print("Requisitos sem teste:", sem_teste)
print("Testes órfãos (não rastreiam a nenhum requisito):", orfaos)
print("Testes sem código identificado:", sem_codigo)
print("Percentual de requisitos cobertos: %.0f%%" % (100 * (len(requisitos) - len(sem_teste)) / len(requisitos)))
