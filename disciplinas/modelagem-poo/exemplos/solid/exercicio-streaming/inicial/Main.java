import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Exercício de SOLID, versão inicial (ruim). Escopo: streaming de música (Melodia).
 * Tarefa: corrigir S, O, L, I e D, um de cada vez, sem mudar a saída.
 */
public class Main {

    static class Musica {
        final String titulo;
        final int segundos;
        Musica(String titulo, int segundos) { this.titulo = titulo; this.segundos = segundos; }
    }

    static class Usuario {
        final String nome;
        final String plano;   // "FREE", "PREMIUM" ou "FAMILIA"
        Usuario(String nome, String plano) { this.nome = nome; this.plano = plano; }
    }

    static class HistoricoArquivo {
        void registrar(String linha) { System.out.println("gravando em historico.txt: " + linha); }
    }

    // S: este método faz tudo. O: um plano novo exige editar os ifs.
    static class Player {
        private final HistoricoArquivo historico = new HistoricoArquivo();   // D: dependência fixa

        void tocar(Usuario u, Musica m) {
            int segundos = m.segundos;
            if (u.plano.equals("FREE") && segundos > 30) {
                segundos = 30;
                System.out.println("[" + u.nome + "] limite do plano: 30 s de " + m.titulo);
            }
            System.out.println("tocando " + m.titulo + " para " + u.nome);
            historico.registrar(u.nome + ": " + m.titulo);
            double royalties;
            if (u.plano.equals("PREMIUM") || u.plano.equals("FAMILIA")) {
                royalties = segundos * 0.002;
            } else {
                royalties = segundos * 0.001;
            }
            System.out.printf("royalties: R$ %.3f%n", royalties);
        }
    }

    // I: interface gorda, com um método que nem toda classe pode cumprir
    interface Biblioteca {
        List<Musica> musicas();
        void adicionar(Musica m);
    }

    static class Playlist implements Biblioteca {
        private final List<Musica> musicas = new ArrayList<>();
        public List<Musica> musicas() { return musicas; }
        public void adicionar(Musica m) { musicas.add(m); }
    }

    // I e L: não aceita adicionar; quem usa Biblioteca espera que adicionar funcione
    static class PlaylistPublica implements Biblioteca {
        private final List<Musica> musicas;
        PlaylistPublica(List<Musica> musicas) { this.musicas = musicas; }
        public List<Musica> musicas() { return musicas; }
        public void adicionar(Musica m) {
            throw new UnsupportedOperationException("playlist pública é só leitura");
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        Player player = new Player();
        player.tocar(new Usuario("Ana", "FREE"), new Musica("Aquarela", 200));
        player.tocar(new Usuario("Bruno", "PREMIUM"), new Musica("Garota", 180));
        player.tocar(new Usuario("Carla", "FAMILIA"), new Musica("Samba", 240));

        Biblioteca publica = new PlaylistPublica(new ArrayList<>(List.of(new Musica("Garota", 180))));
        try {
            publica.adicionar(new Musica("Samba", 240));
        } catch (UnsupportedOperationException e) {
            System.out.println("erro: " + e.getMessage());
        }
        System.out.println("playlist pública tem " + publica.musicas().size() + " música(s)");
    }
}
