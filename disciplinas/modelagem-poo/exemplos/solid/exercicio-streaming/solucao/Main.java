import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Exercício de SOLID, solução. Mesma saída da versão inicial, na parte do player e da playlist,
 * com o histórico em memória e a playlist pública só de leitura.
 */
public class Main {

    // S e imutabilidade: dados sem comportamento de negócio
    record Musica(String titulo, int segundos) {}

    // O: cada plano é uma classe nova; o player não muda ao criar um plano
    interface Plano {
        int limiteSegundos();
        double royaltyPorSegundo();
    }

    static class PlanoFree implements Plano {
        public int limiteSegundos() { return 30; }
        public double royaltyPorSegundo() { return 0.001; }
    }

    static class PlanoPremium implements Plano {
        public int limiteSegundos() { return Integer.MAX_VALUE; }
        public double royaltyPorSegundo() { return 0.002; }
    }

    static class PlanoFamilia implements Plano {
        public int limiteSegundos() { return Integer.MAX_VALUE; }
        public double royaltyPorSegundo() { return 0.002; }
    }

    record Usuario(String nome, Plano plano) {}

    // D: o player depende da abstração Historico; quem monta escolhe a implementação
    interface Historico {
        void registrar(String linha);
    }

    static class HistoricoMemoria implements Historico {
        final List<String> linhas = new ArrayList<>();
        public void registrar(String linha) { linhas.add(linha); }
    }

    // S: o player só coordena; cada regra vive em um lugar
    static class Player {
        private final Historico historico;

        Player(Historico historico) { this.historico = historico; }

        void tocar(Usuario u, Musica m) {
            int segundos = Math.min(m.segundos(), u.plano().limiteSegundos());
            if (segundos < m.segundos()) {
                System.out.println("[" + u.nome() + "] limite do plano: " + segundos + " s de " + m.titulo());
            }
            System.out.println("tocando " + m.titulo() + " para " + u.nome());
            historico.registrar(u.nome() + ": " + m.titulo());
            double royalties = segundos * u.plano().royaltyPorSegundo();
            System.out.printf("royalties: R$ %.3f%n", royalties);
        }
    }

    // I e L: consulta e edição são contratos separados; quem só lê não promete edição
    interface Consulta {
        List<Musica> musicas();
    }

    interface Edicao {
        void adicionar(Musica m);
    }

    static class Playlist implements Consulta, Edicao {
        private final List<Musica> musicas = new ArrayList<>();
        public List<Musica> musicas() { return musicas; }
        public void adicionar(Musica m) { musicas.add(m); }
    }

    static class PlaylistPublica implements Consulta {
        private final List<Musica> musicas;
        PlaylistPublica(List<Musica> musicas) { this.musicas = musicas; }
        public List<Musica> musicas() { return musicas; }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        HistoricoMemoria historico = new HistoricoMemoria();
        Player player = new Player(historico);
        player.tocar(new Usuario("Ana", new PlanoFree()), new Musica("Aquarela", 200));
        player.tocar(new Usuario("Bruno", new PlanoPremium()), new Musica("Garota", 180));
        player.tocar(new Usuario("Carla", new PlanoFamilia()), new Musica("Samba", 240));
        System.out.println("histórico: " + historico.linhas);

        Edicao minha = new Playlist();
        minha.adicionar(new Musica("Aquarela", 200));
        Consulta publica = new PlaylistPublica(List.of(new Musica("Garota", 180)));
        System.out.println("playlist pública tem " + publica.musicas().size() + " música(s)");
    }
}
