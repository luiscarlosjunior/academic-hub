"""
Tópico 7 · Transações distribuídas: commit em duas fases (2PC) e sagas.
Execute com: python3 07-transacoes-distribuidas.py
"""


class Participante:
    def __init__(self, nome, pode_confirmar=True):
        self.nome = nome
        self.pode_confirmar = pode_confirmar
        self.estado = "pronto"       # pronto, preparado, commit, abort
        self.dados_travados = False

    def prepara(self):
        if not self.pode_confirmar:
            return "NÃO"
        self.estado = "preparado"    # grava no log e trava os dados
        self.dados_travados = True
        return "SIM"

    def decide(self, decisao):
        self.estado = "commit" if decisao == "COMMIT" else "abort"
        self.dados_travados = False  # libera as travas


class Coordenador:
    def __init__(self):
        self.log = []                # decisão registrada antes de avisar ninguém

    def executa(self, participantes, cai_apos_votos=False):
        votos = [p.prepara() for p in participantes]
        if cai_apos_votos:
            return "coordenador caiu antes de decidir"
        decisao = "COMMIT" if all(v == "SIM" for v in votos) else "ABORT"
        self.log.append(decisao)
        for p in participantes:
            p.decide(decisao)
        return decisao


def resumo(participantes):
    return ", ".join(f"{p.nome}={p.estado}{' (travado)' if p.dados_travados else ''}" for p in participantes)


def cenarios_2pc():
    print("Commit em duas fases, três participantes:")

    ps = [Participante("P1"), Participante("P2"), Participante("P3")]
    print("  1. todos votam SIM:", Coordenador().executa(ps))
    print("     ", resumo(ps))

    ps = [Participante("P1"), Participante("P2", pode_confirmar=False), Participante("P3")]
    print("  2. P2 vota NÃO:", Coordenador().executa(ps))
    print("     ", resumo(ps))

    ps = [Participante("P1"), Participante("P2"), Participante("P3")]
    print("  3. coordenador cai após os votos SIM:", Coordenador().executa(ps, cai_apos_votos=True))
    print("     ", resumo(ps))
    print("     participantes presos com dados travados:", sum(p.dados_travados for p in ps))


class Saga:
    """Sequência de passos locais, cada um com sua compensação desfeita em ordem inversa."""

    def __init__(self, passos):
        self.passos = passos         # lista de (nome, ação, compensação)

    def executa(self):
        feitos = []
        for nome, acao, compensa in self.passos:
            try:
                acao()
                feitos.append((nome, compensa))
                print(f"    ok: {nome}")
            except RuntimeError as erro:
                print(f"    falhou: {nome} ({erro})")
                for nome_c, comp in reversed(feitos):
                    comp()
                    print(f"    compensado: {nome_c}")
                return "desfeita"
        return "concluída"


def cenario_saga(falha_no_envio):
    estoque = {"reservado": False}
    cartao = {"cobrado": False}
    envio = {"agendado": False}

    def reserva():
        estoque["reservado"] = True

    def libera():
        estoque["reservado"] = False

    def cobra():
        cartao["cobrado"] = True

    def estorna():
        cartao["cobrado"] = False

    def agenda():
        if falha_no_envio:
            raise RuntimeError("transportadora indisponível")
        envio["agendado"] = True

    saga = Saga([
        ("reservar estoque", reserva, libera),
        ("cobrar cartão", cobra, estorna),
        ("agendar envio", agenda, lambda: None),
    ])
    resultado = saga.executa()
    print(f"    resultado: {resultado}; estoque reservado={estoque['reservado']}, "
          f"cobrado={cartao['cobrado']}, enviado={envio['agendado']}")


if __name__ == "__main__":
    cenarios_2pc()
    print("\nSaga de pedido, caso de sucesso:")
    cenario_saga(falha_no_envio=False)
    print("\nSaga de pedido, falha no envio:")
    cenario_saga(falha_no_envio=True)
