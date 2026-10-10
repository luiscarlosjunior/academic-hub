package melodia;

/**
 * Vínculo do ouvinte com um plano, cobrado de uma conta.
 * Regra R3: sem saldo na cobrança, a assinatura é SUSPENSA (não cancelada).
 * Regra R4: uma assinatura CANCELADA não é mais cobrada.
 */
public class Assinatura {

    private final Plano plano;
    private final ContaBancaria conta;
    private StatusAssinatura status = StatusAssinatura.ATIVA;

    public Assinatura(Plano plano, ContaBancaria conta) {
        if (plano == null || conta == null) {
            throw new IllegalArgumentException("plano e conta são obrigatórios");
        }
        this.plano = plano;
        this.conta = conta;
    }

    /**
     * Tenta cobrar o valor mensal. Retorna true se cobrou.
     * Se faltar saldo, suspende (R3). Assinatura cancelada não é cobrada (R4).
     */
    public boolean cobrar() {
        if (status == StatusAssinatura.CANCELADA) {
            throw new IllegalStateException("assinatura cancelada não pode ser cobrada (R4)");
        }
        if (conta.debitarAssinatura(plano.getPrecoMensal())) {
            mudarStatus(StatusAssinatura.ATIVA);
            return true;
        }
        mudarStatus(StatusAssinatura.SUSPENSA);
        return false;
    }

    public void cancelar() {
        mudarStatus(StatusAssinatura.CANCELADA);
    }

    /** Todas as mudanças de status passam por aqui, e a máquina de estados é respeitada. */
    private void mudarStatus(StatusAssinatura destino) {
        if (status == destino) return;
        if (!status.podeIr(destino)) {
            throw new IllegalStateException(status + " não pode ir para " + destino);
        }
        status = destino;
    }

    public Plano getPlano()          { return plano; }
    public StatusAssinatura getStatus() { return status; }
}
