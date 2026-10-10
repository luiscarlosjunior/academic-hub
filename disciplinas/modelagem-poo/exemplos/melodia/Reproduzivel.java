package melodia;

/**
 * INTERFACE: um contrato, sem estado. Qualquer conteúdo que o player consegue tocar a implementa.
 * Música e podcast são coisas diferentes, mas o player trata as duas da mesma forma (polimorfismo).
 */
public interface Reproduzivel {

    /** Duração total em segundos. */
    int duracaoSegundos();

    /** Texto curto para listas e telas. */
    String descricao();

    /** Método default (Java 8+): comportamento comum, que as implementações herdam. */
    default String duracaoFormatada() {
        return String.format("%d:%02d", duracaoSegundos() / 60, duracaoSegundos() % 60);
    }
}
