package exercicios.ex1;

import java.util.*;

/** Exercício 1: Ouvinte "1" -- "0..*" Playlist, em que a playlist é criada pelo ouvinte. */
public class Ouvinte {
    private final List<Playlist> playlists = new ArrayList<>();

    // o ouvinte cria a playlist com new → composição do lado do ouvinte
    public Playlist montarPlaylist(String nome) {
        Playlist p = new Playlist(nome);
        playlists.add(p);
        return p;
    }

    public List<Playlist> getPlaylists() {
        return Collections.unmodifiableList(playlists);
    }
}
