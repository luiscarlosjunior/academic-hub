package melodia;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Artista publica álbuns (agregação de álbuns) e recebe royalties por reprodução. */
public class Artista extends Usuario {

    private final List<Album> albuns = new ArrayList<>();

    public Artista(String nome) {
        super(nome);
    }

    public void publicar(Album album) {
        if (album == null) throw new IllegalArgumentException("álbum nulo");
        albuns.add(album);
    }

    @Override
    public String tipoDePerfil() { return "Artista"; }

    public List<Album> getAlbuns() { return Collections.unmodifiableList(albuns); }
}
