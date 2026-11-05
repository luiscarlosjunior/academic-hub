"""Fronteira de Pareto entre alternativas arquiteturais.

Uma alternativa A domina B se A é pelo menos tão boa em todos os atributos
e estritamente melhor em pelo menos um. Alternativas dominadas nunca devem
ser escolhidas, qualquer que seja o peso dos atributos. As notas são de 1 a 5
(maior é melhor; para custo, 5 significa mais barato). Dados fictícios.
"""

atributos = ["desempenho", "escalabilidade", "simplicidade", "custo"]
alternativas = {
    "monólito":            [2, 1, 5, 5],
    "monólito modular":    [3, 2, 4, 4],
    "microsserviços":      [4, 5, 1, 2],
    "serverless":          [3, 4, 3, 3],
    "monólito com cache":  [4, 1, 4, 4],
    "microsserviços caros": [3, 4, 1, 1],  # dominada por "microsserviços"
}

def domina(a, b):
    return all(x >= y for x, y in zip(a, b)) and any(x > y for x, y in zip(a, b))

fronteira = []
for nome, nota in alternativas.items():
    if not any(domina(outra, nota) for o, outra in alternativas.items() if o != nome):
        fronteira.append(nome)

print("Atributos:", ", ".join(atributos))
for nome, nota in alternativas.items():
    marca = "NA FRONTEIRA" if nome in fronteira else "dominada"
    quem = [o for o, outra in alternativas.items() if o != nome and domina(outra, nota)]
    print(f"  {nome:<20} {nota}  {marca}" + (f"  (dominada por: {', '.join(quem)})" if quem else ""))
