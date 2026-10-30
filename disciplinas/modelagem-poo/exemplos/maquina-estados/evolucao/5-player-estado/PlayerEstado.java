import java.util.ArrayList;
import java.util.List;

/**
 * Nível 5: padrão State com enum. Cada estado é uma constante que decide,
 * sozinha, o próximo estado para cada evento. Null significa "evento recusado".
 * Ações de entrada e saída ficam junto da máquina, em um único lugar.
 */
public class PlayerEstado {

    enum Estado {
        PARADO {
            @Override Estado play() { return BUFFERIZANDO; }
        },
        BUFFERIZANDO {
            // guarda: só toca com pelo menos 3 segundos no buffer
            @Override Estado bufferCheio(int segundos) { return segundos >= 3 ? TOCANDO : null; }
            @Override Estado stop() { return PARADO; }
        },
        TOCANDO {
            @Override Estado pause() { return PAUSADO; }
            @Override Estado bufferVazio() { return BUFFERIZANDO; }
            @Override Estado fimDaFaixa() { return PARADO; }
            @Override Estado stop() { return PARADO; }
        },
        PAUSADO {
            @Override Estado play() { return TOCANDO; }
            @Override Estado stop() { return PARADO; }
        };

        // Comportamento padrão: o evento não tem transição neste estado.
        Estado play() { return null; }
        Estado pause() { return null; }
        Estado bufferCheio(int segundos) { return null; }
        Estado bufferVazio() { return null; }
        Estado fimDaFaixa() { return null; }
        Estado stop() { return null; }
    }

    private Estado estado = Estado.PARADO;
    private int segundosNoBuffer;
    private final List<String> log = new ArrayList<>();

    boolean play() { return aplicar(estado.play(), "PLAY"); }
    boolean pause() { return aplicar(estado.pause(), "PAUSE"); }
    boolean bufferCheio() { return aplicar(estado.bufferCheio(segundosNoBuffer), "BUFFER_CHEIO"); }
    boolean bufferVazio() { return aplicar(estado.bufferVazio(), "BUFFER_VAZIO"); }
    boolean fimDaFaixa() { return aplicar(estado.fimDaFaixa(), "FIM_DA_FAIXA"); }
    boolean stop() { return aplicar(estado.stop(), "STOP"); }

    void carregarSegundo() {
        if (estado == Estado.BUFFERIZANDO) {
            segundosNoBuffer++;
        }
    }

    private boolean aplicar(Estado destino, String evento) {
        if (destino == null) {
            log.add(String.format("  %-13s + %-14s -> recusado", estado, evento));
            return false;
        }
        Estado anterior = estado;
        estado = destino;
        if (destino == Estado.BUFFERIZANDO) {
            segundosNoBuffer = 0; // ação de entrada: começa a contar do zero
        }
        log.add(String.format("  %-13s + %-14s -> %s", anterior, evento, estado));
        return true;
    }

    Estado getEstado() { return estado; }
    List<String> getLog() { return log; }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);

        System.out.println("== 1. Reprodução feliz");
        PlayerEstado feliz = new PlayerEstado();
        feliz.play();
        feliz.carregarSegundo(); feliz.carregarSegundo(); feliz.carregarSegundo();
        feliz.bufferCheio();
        feliz.pause();
        feliz.play();
        feliz.fimDaFaixa();
        feliz.getLog().forEach(System.out::println);
        System.out.println("estado final: " + feliz.getEstado());

        System.out.println("\n== 2. A rede cai e o buffer esvazia");
        PlayerEstado queda = new PlayerEstado();
        queda.play();
        queda.carregarSegundo(); queda.carregarSegundo(); queda.carregarSegundo();
        queda.bufferCheio();
        queda.bufferVazio();
        queda.pause();                       // recusado: nada está tocando
        queda.carregarSegundo(); queda.carregarSegundo(); queda.carregarSegundo();
        queda.bufferCheio();
        queda.getLog().forEach(System.out::println);
        System.out.println("estado final: " + queda.getEstado());

        System.out.println("\n== 3. Guarda do buffer mínimo");
        PlayerEstado curto = new PlayerEstado();
        curto.play();
        curto.carregarSegundo();
        curto.bufferCheio();                 // guarda falsa: 1 segundo
        curto.getLog().forEach(System.out::println);
        System.out.println("estado final: " + curto.getEstado());
    }
}
