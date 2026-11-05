"""Dois erros de lógica clássicos: off-by-one e argumento padrão mutável."""

v = [10, 20, 30]
print("off-by-one, percorrendo com range(len(v) + 1):")
try:
    for i in range(len(v) + 1):
        print("  ", v[i])
except IndexError as e:
    print("   IndexError:", e)

def adiciona(item, lista=[]):          # armadilha: a lista é criada uma vez
    lista.append(item)
    return lista

print("argumento padrão mutável:")
print("  ", adiciona(1))
print("  ", adiciona(2))

def adiciona_certo(item, lista=None):
    if lista is None:
        lista = []
    lista.append(item)
    return lista

print("correção com None:")
print("  ", adiciona_certo(1))
print("  ", adiciona_certo(2))
