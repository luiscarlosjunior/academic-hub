"""Padrão Strangler Fig: a fachada decide para onde cada requisição vai.

Duas decisões: (1) o prefixo da rota, que determina se ela já foi migrada;
(2) uma fatia de usuários (por hash estável do identificador), que permite
migrar gradualmente uma rota já validada, com reversão imediata.
"""
import zlib

LEGADO = "monolito"
ROTAS_MIGRADAS = {"/catalogo": "catalogo-svc"}     # rota -> serviço novo
PERCENTUAL_NOVO = {"/catalogo": 25}                # % de usuários no serviço novo

def destino(caminho, usuario_id):
    # prefixos mais específicos primeiro; a fronteira '/' impede '/catalogo-antigo'
    for prefixo in sorted(ROTAS_MIGRADAS, key=len, reverse=True):
        if caminho == prefixo or caminho.startswith(prefixo + "/"):
            faixa = zlib.crc32(str(usuario_id).encode()) % 100   # 0..99, estável
            if faixa < PERCENTUAL_NOVO.get(prefixo, 0):
                return ROTAS_MIGRADAS[prefixo]
            return LEGADO
    return LEGADO

assert destino("/catalogo/busca", 1) in (LEGADO, "catalogo-svc")
assert destino("/catalogo-antigo", 1) == LEGADO    # não é o prefixo
assert destino("/pedidos/42", 1) == LEGADO         # ainda no legado

print("Distribuição do tráfego de /catalogo em 10.000 usuários:")
for pct in [0, 25, 50, 100]:
    PERCENTUAL_NOVO["/catalogo"] = pct
    contagem = {LEGADO: 0, "catalogo-svc": 0}
    for uid in range(10_000):
        contagem[destino("/catalogo/item", uid)] += 1
    print(f"  {pct:>3}% migrado -> legado: {contagem[LEGADO]:>5}  novo: {contagem['catalogo-svc']:>5}")

PERCENTUAL_NOVO["/catalogo"] = 0
print("Reversão imediata (0%):", destino("/catalogo/item", 7))
