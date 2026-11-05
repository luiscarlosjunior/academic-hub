"""Logs estruturados e mascaramento de dados sensíveis.

Cada evento é uma linha de pares chave=valor, fácil de pesquisar e agregar.
Campos sensíveis são mascarados antes de qualquer registro. O carimbo de
tempo é omitido para que a saída seja reproduzível.
"""
import logging
import sys

SENSIVEIS = {"cartao", "senha", "token"}

class FormatoEstruturado(logging.Formatter):
    def format(self, record):
        campos = getattr(record, "campos", {})
        pares = " ".join(f"{k}={v}" for k, v in campos.items())
        return f"{record.levelname} evento={record.getMessage()} {pares}".rstrip()

def mascara(campos):
    return {k: ("***" if k in SENSIVEIS else v) for k, v in campos.items()}

log = logging.getLogger("pagamentos")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(FormatoEstruturado())
log.addHandler(handler)
log.setLevel(logging.INFO)

def registra(evento, nivel, **campos):
    log.log(nivel, evento, extra={"campos": mascara(campos)})

registra("cobranca_ok", logging.INFO, pedido_id=42, valor="80.00", cartao="4111111111111111")
registra("cobranca_recusada", logging.WARNING, pedido_id=43, motivo="saldo_insuficiente")
registra("gateway_timeout", logging.ERROR, pedido_id=44, tentativa=3, token="abc123")
