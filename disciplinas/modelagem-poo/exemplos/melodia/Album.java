package melodia;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * COMPOSIÇÃO: o álbum cria as próprias faixas.
 * Uma faixa só existe dentro do álbum; a lista não é exposta para alteração externa.
 * Multiplicidade 1..* : todo álbum tem pelo menos uma faixa, verificada na criação.
 */
public class Album {

    private final String titulo;
    private final String artista;
    private final int ano;
    private final List<Musica> faixas = new ArrayList<>();

    public Album(String titulo, String artista, int ano, String primeiraFaixa, int duracao) {
        this.titulo = titulo;
        this.artista = artista;
        this.ano = ano;
        adicionarFaixa(primeiraFaixa, duracao);   // 1..*: nasce com pelo menos uma faixa
    }

    /** O álbum é o criador da faixa (composição). */
    public Musica adicionarFaixa(String tituloFaixa, int duracao) {
        Musica m = new Musica(tituloFaixa, artista, duracao);
        faixas.add(m);
        return m;
    }

    public String getTitulo()  { return titulo; }
    public String getArtista() { return artista; }
    public int getAno()        { return ano; }

    /** Cópia defensiva: quem chama não consegue alterar as faixas do álbum. */
    public List<Musica> getFaixas() {
        return Collections.unmodifiableList(faixas);
    }
}
