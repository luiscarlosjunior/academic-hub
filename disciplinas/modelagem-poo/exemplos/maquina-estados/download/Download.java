import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Download offline de álbum no Melodia, com a tabela de transições escrita em código.
 * Em vez de um switch gigante, a máquina é uma tabela: estado atual -> evento -> próximo estado.
 * Quem lê a tabela enxerga o diagrama inteiro, e cada célula vazia é uma transição recusada.
 */
public class Download {

    enum Estado { NAO_BAIXADO, BAIXANDO, BAIXADO, FALHOU }

    enum Evento { BAIXAR, RECEBER_TUDO, REDE_CAIU, TENTAR_NOVAMENTE, REMOVER, PLANO_EXPIROU }

    // A tabela de transições. Cada linha é uma seta do diagrama.
    private static final Map<Estado, Map<Evento, Estado>> TABELA = new EnumMap<>(Estado.class);

    static {
        adicionar(Estado.NAO_BAIXADO, Evento.BAIXAR, Estado.BAIXANDO);
        adicionar(Estado.BAIXANDO, Evento.RECEBER_TUDO, Estado.BAIXADO);
        adicionar(Estado.BAIXANDO, Evento.REDE_CAIU, Estado.FALHOU);
        adicionar(Estado.FALHOU, Evento.TENTAR_NOVAMENTE, Estado.BAIXANDO);
        adicionar(Estado.BAIXADO, Evento.REMOVER, Estado.NAO_BAIXADO);
        adicionar(Estado.BAIXADO, Evento.PLANO_EXPIROU, Estado.NAO_BAIXADO);
    }

    private static void adicionar(Estado de, Evento evento, Estado para) {
        TABELA.computeIfAbsent(de, k -> new EnumMap<>(Evento.class)).put(evento, para);
    }

    static final class Album {
        private final String nome;
        private final boolean premium;
        private Estado estado = Estado.NAO_BAIXADO;
        private final List<String> log = new ArrayList<>();

        Album(String nome, boolean premium) {
            this.nome = nome;
            this.premium = premium;
        }

        /** Dispara um evento. Devolve false quando a transição não existe ou a guarda falha. */
        boolean disparar(Evento evento) {
            // guarda: só assinante Premium pode baixar
            if (evento == Evento.BAIXAR && !premium) {
                log.add(String.format("  %-12s + %-16s -> recusado [guarda: plano Free]", estado, evento));
                return false;
            }
            Estado proximo = TABELA.getOrDefault(estado, Map.of()).get(evento);
            if (proximo == null) {
                log.add(String.format("  %-12s + %-16s -> recusado (sem transição na tabela)", estado, evento));
                return false;
            }
            log.add(String.format("  %-12s + %-16s -> %s", estado, evento, proximo));
            estado = proximo;
            return true;
        }

        Estado getEstado() { return estado; }
        List<String> getLog() { return log; }
        String getNome() { return nome; }
    }

    static void imprimirTabela() {
        System.out.println("Tabela de transições (estado -> evento -> próximo):");
        for (Estado de : Estado.values()) {
            Map<Evento, Estado> linha = TABELA.getOrDefault(de, Map.of());
            for (Map.Entry<Evento, Estado> t : linha.entrySet()) {
                System.out.printf("  %-12s --%s--> %s%n", de, t.getKey(), t.getValue());
            }
        }
    }

    static void cenario(String titulo, Album album, Evento... eventos) {
        System.out.println("\n== " + titulo + " (" + album.getNome() + ")");
        for (Evento e : eventos) album.disparar(e);
        album.getLog().forEach(System.out::println);
        System.out.println("estado final: " + album.getEstado());
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);
        imprimirTabela();

        cenario("1. Download completo", new Album("Abbey Road", true),
                Evento.BAIXAR, Evento.RECEBER_TUDO);

        cenario("2. Rede cai no meio e a pessoa tenta de novo", new Album("Rumours", true),
                Evento.BAIXAR, Evento.REDE_CAIU, Evento.TENTAR_NOVAMENTE, Evento.RECEBER_TUDO);

        cenario("3. Plano Free tenta baixar", new Album("Thriller", false),
                Evento.BAIXAR);

        cenario("4. Plano expira depois do download", new Album("Random Access Memories", true),
                Evento.BAIXAR, Evento.RECEBER_TUDO, Evento.PLANO_EXPIROU);

        cenario("5. Evento que não existe no estado", new Album("Dark Side", true),
                Evento.RECEBER_TUDO);
    }
}
