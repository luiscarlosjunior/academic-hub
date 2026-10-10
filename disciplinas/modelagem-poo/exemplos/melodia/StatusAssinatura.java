package melodia;

/**
 * Estados da assinatura, conforme o diagrama de máquina de estados.
 * As transições permitidas ficam em um único lugar: podeIr().
 */
public enum StatusAssinatura {
    ATIVA, SUSPENSA, CANCELADA;

    /** Regra R4: CANCELADA é estado final (não tem saída). */
    public boolean podeIr(StatusAssinatura destino) {
        return switch (this) {
            case ATIVA     -> destino == SUSPENSA || destino == CANCELADA;
            case SUSPENSA  -> destino == ATIVA || destino == CANCELADA;
            case CANCELADA -> false;
        };
    }
}
