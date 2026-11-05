"""Complexidade ciclomática (McCabe, 1976) medida sobre código-fonte real.

CC = 1 + número de pontos de decisão. Conta-se cada if, elif, laço, cláusula
except, operador booleano e expressão condicional. O código analisado é
lido com o módulo ast da biblioteca padrão, sem executá-lo.
"""
import ast

CODIGO = '''
def classifica(nota, falta):
    if falta > 25:
        return "reprovado por falta"
    if nota >= 7:
        return "aprovado"
    elif nota >= 4:
        return "recuperação"
    return "reprovado"

def processa(pedidos):
    total = 0
    for p in pedidos:
        if p["ativo"] and p["valor"] > 0:
            total += p["valor"]
        elif p["valor"] < 0:
            raise ValueError("valor negativo")
    return total

def simples(x):
    return x * 2
'''

class Contador(ast.NodeVisitor):
    def __init__(self):
        self.cc = 1
    def visit_If(self, n):
        self.cc += 1; self.generic_visit(n)
    def visit_For(self, n):
        self.cc += 1; self.generic_visit(n)
    def visit_While(self, n):
        self.cc += 1; self.generic_visit(n)
    def visit_ExceptHandler(self, n):
        self.cc += 1; self.generic_visit(n)
    def visit_BoolOp(self, n):
        self.cc += len(n.values) - 1; self.generic_visit(n)
    def visit_IfExp(self, n):
        self.cc += 1; self.generic_visit(n)

arvore = ast.parse(CODIGO)
LIMITE = 10
print(f"{'função':<12}{'CC':>4}  avaliação")
for no in arvore.body:
    if isinstance(no, ast.FunctionDef):
        c = Contador()
        c.visit(no)
        aval = "ok" if c.cc <= LIMITE else "alta: candidata a refatoração"
        print(f"{no.name:<12}{c.cc:>4}  {aval}")
