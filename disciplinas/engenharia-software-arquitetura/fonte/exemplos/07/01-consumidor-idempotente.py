"""Consumidor idempotente com retentativas, backoff e fila de mensagens mortas.

Entrega 'pelo menos uma vez': a mesma mensagem pode chegar mais de uma vez.
O consumidor registra os identificadores já processados e ignora repetições.
Falhas transitórias são retentadas; falhas permanentes vão para a DLQ.
A semente fixa torna a execução reproduzível.
"""
import random

random.seed(7)
MAX_TENTATIVAS = 3
processados = set()     # em produção: tabela com chave única, na mesma transação do efeito
dlq = []
efeitos = []            # simula o efeito externo (ex.: e-mail enviado)

class FalhaPermanente(Exception):
    pass

class FalhaTransitoria(Exception):
    pass

def efeito_externo(msg):
    if msg["valor"] < 0:
        raise FalhaPermanente("valor negativo")
    if random.random() < 0.4:
        raise FalhaTransitoria("servidor indisponível")
    efeitos.append(msg["id"])

def consome(msg):
    if msg["id"] in processados:
        print(f"  mensagem {msg['id']}: repetição ignorada")
        return
    for tentativa in range(1, MAX_TENTATIVAS + 1):
        try:
            efeito_externo(msg)
            processados.add(msg["id"])
            print(f"  mensagem {msg['id']}: processada na tentativa {tentativa}")
            return
        except FalhaTransitoria:
            print(f"  mensagem {msg['id']}: falha transitória na tentativa {tentativa}")
        except FalhaPermanente as e:
            print(f"  mensagem {msg['id']}: falha permanente ({e})")
            break
    dlq.append(msg["id"])
    print(f"  mensagem {msg['id']}: enviada à DLQ")

fila = [{"id": 1, "valor": 80}, {"id": 2, "valor": -5}, {"id": 3, "valor": 40}, {"id": 1, "valor": 80}]
for m in fila:
    consome(m)

print("efeitos externos aplicados:", efeitos)
print("DLQ:", dlq)
