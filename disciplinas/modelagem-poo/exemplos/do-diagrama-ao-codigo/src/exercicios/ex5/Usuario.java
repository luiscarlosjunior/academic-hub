package exercicios.ex5;

import java.util.*;

/** Exercício 5: Usuario "1" *-- "0..*" Playlist {GRATUITO: até 3}. */
public class Usuario {
    public static final int LIMITE_GRATUITO = 3;

    private final String nome;
    private Plano plano = Plano.GRATUITO;
    // composição 0..*
    private final List<Playlist> playlists = new ArrayList<>();

    public Usuario(String nome) { this.nome = Objects.requireNonNull(nome); }

    // a restrição {GRATUITO: até 3} vira validação
    public Playlist criarPlaylist(String nome) {
        if (plano == Plano.GRATUITO && playlists.size() >= LIMITE_GRATUITO)
            throw new IllegalStateException(
                "Plano gratuito: até 3 playlists");
        Playlist p = new Playlist(nome);   // o usuário cria
        playlists.add(p);
        return p;
    }

    public void assinarPremium() { plano = Plano.PREMIUM; }
}
