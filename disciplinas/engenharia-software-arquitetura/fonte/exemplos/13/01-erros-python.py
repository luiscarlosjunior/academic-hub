"""Os erros de Python mais frequentes, provocados de propósito e exibidos.

Cada bloco causa um erro comum e mostra o tipo e a mensagem exata que o
Python produz. Ler a mensagem com atenção é o primeiro passo de qualquer
diagnóstico.
"""

def busca(id_usuario):
    usuarios = {1: "Ana"}
    if id_usuario in usuarios:
        return usuarios[id_usuario]
    # sem return: a função devolve None

casos = {
    "AttributeError": lambda: busca(2).upper(),
    "TypeError": lambda: "idade: " + 30,
    "KeyError": lambda: {"id": 7}["total"],
    "IndexError": lambda: [][0],
    "NameError": lambda: variavel_inexistente,
    "ZeroDivisionError": lambda: 10 / 0,
    "ValueError": lambda: int("12a"),
}

for nome, f in casos.items():
    try:
        f()
    except Exception as e:
        print(f"{nome}: {e}")
