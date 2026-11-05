"""Custo relativo de corrigir um defeito conforme a fase em que ele é detectado.

Os multiplicadores abaixo são HIPOTÉTICOS e servem para ilustrar a tendência
descrita por Boehm (1981) e Boehm & Basili (2001): quanto mais tarde o defeito
é encontrado, maior o custo de correção. Não são medidas de um projeto real.
"""

FASES = ["Requisitos", "Projeto", "Codificação", "Teste de sistema", "Produção"]
MULTIPLICADOR = {"Requisitos": 1, "Projeto": 5, "Codificação": 10, "Teste de sistema": 25, "Produção": 100}

def custo_defeito(fase_insercao, fase_deteccao):
    """Custo = 1 unidade de base * multiplicador da fase de detecção.
    Se o defeito foi inserido em Requisitos e detectado tarde, a correção
    atravessa as fases seguintes (cada uma contribui com seu multiplicador)."""
    i = FASES.index(fase_insercao)
    j = FASES.index(fase_deteccao)
    return MULTIPLICADOR[fase_deteccao] if j == i else MULTIPLICADOR[fase_deteccao] * (j - i + 1)

print("Custo relativo de um defeito inserido em Requisitos, por fase de detecção:")
for fase in FASES:
    print(f"  detectado em {fase:<17} -> custo {custo_defeito('Requisitos', fase):>4}")

print()
print("Mesmo defeito, detectado na fase em que foi inserido (Codificação):",
      custo_defeito("Codificação", "Codificação"))
