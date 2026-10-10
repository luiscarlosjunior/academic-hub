package melodia;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Usuário que ouve músicas. Tem exatamente uma assinatura (multiplicidade 1)
 * e pode montar várias playlists (0..*). Ponto único de criação das playlists.
 */
public class Ouvinte extends Usuario {

    private final Assinatura assinatura;
    private final List<Playlist> playlists = new ArrayList<>();

    public Ouvinte(String nome, Assinatura assinatura) {
        super(nome);
        if (assinatura == null) {
            throw new IllegalArgumentException("todo ouvinte tem uma assinatura (multiplicidade 1)");
        }
        this.assinatura = assinatura;
    }

    public Playlist montarPlaylist(String nomePlaylist) {
        Playlist p = new Playlist(nomePlaylist, this);
        playlists.add(p);
        return p;
    }

    @Override
    public String tipoDePerfil() { return "Ouvinte"; }

    public Assinatura getAssinatura()         { return assinatura; }
    public List<Playlist> getPlaylists()      { return Collections.unmodifiableList(playlists); }
}
