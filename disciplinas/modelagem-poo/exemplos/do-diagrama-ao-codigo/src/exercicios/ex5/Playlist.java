package exercicios.ex5;

import java.util.*;

/** Playlist "1" o-- "0..*" Musica  (agregação: a música vem do catálogo). */
public class Playlist {
    private final String nome;
    private final List<Musica> musicas = new ArrayList<>();

    Playlist(String nome) { this.nome = nome; }

    // agregação: a música vem do catálogo
    public void adicionar(Musica m) {
        musicas.add(Objects.requireNonNull(m));
    }

    public List<Musica> getMusicas() {
        return Collections.unmodifiableList(musicas);
    }
}
