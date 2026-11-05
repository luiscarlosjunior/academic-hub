"""Condição de corrida (check-then-act), reproduzida de forma determinística.

Duas operações de saque são intercaladas manualmente, para que o efeito da
corrida apareça sempre, e não apenas em algumas execuções. Depois, a versão
com trava (simulada por ordem de execução) mostra a correção.
"""

def saque_inseguro_passo1(saldo, valor):
    # verificação (check): lê o saldo
    return saldo >= valor

def saque_inseguro_passo2(saldo, valor):
    # ação (act): debita sem reverificar
    return saldo - valor

saldo = 100
ok_a = saque_inseguro_passo1(saldo, 80)    # cliente A verifica
ok_b = saque_inseguro_passo1(saldo, 80)    # cliente B verifica antes de A debitar
if ok_a:
    saldo = saque_inseguro_passo2(saldo, 80)
if ok_b:
    saldo = saque_inseguro_passo2(saldo, 80)
print("sem trava, dois saques de 80 sobre saldo 100 -> saldo final:", saldo)

saldo = 100
def saque_seguro(valor):
    global saldo
    if saldo >= valor:       # verificação e ação dentro da mesma seção crítica
        saldo -= valor
        return True
    return False
resultados = [saque_seguro(80), saque_seguro(80)]
print("com seção crítica, resultados:", resultados, "saldo final:", saldo)
