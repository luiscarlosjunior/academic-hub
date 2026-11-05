"""Tratamento de erros: específico, encadeado e sem engolir falhas.

Compara três estilos: engolir a exceção (anti-padrão), capturar tudo e
devolver None, e a versão recomendada: tipos específicos, causa preservada
e mensagem que diz o que deu errado.
"""

class PagamentoRecusado(Exception):
    pass

class GatewayIndisponivel(Exception):
    pass

def cobra_ruim(valor, gateway):
    try:
        return gateway(valor)
    except:                      # anti-padrão: engole tudo
        return None

def cobra_boa(valor, gateway):
    if valor <= 0:
        raise ValueError("valor deve ser maior que zero")
    try:
        return gateway(valor)
    except ConnectionError as erro:
        raise GatewayIndisponivel("gateway fora do ar, tente novamente") from erro

def gateway_fora(valor):
    raise ConnectionError("tempo esgotado após 5 s")

print("1. anti-padrão, com gateway fora do ar:", cobra_ruim(80, gateway_fora))
print("   -> o chamador não sabe se houve falha, recusa ou sucesso.")

try:
    cobra_boa(80, gateway_fora)
except GatewayIndisponivel as e:
    print("2. recomendado:", type(e).__name__, "-", e)
    print("   causa original preservada:", type(e.__cause__).__name__, "-", e.__cause__)

try:
    cobra_boa(-5, gateway_fora)
except ValueError as e:
    print("3. entrada inválida, falha cedo:", e)
