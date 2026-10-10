package melodia;

import java.util.Objects;

/**
 * Faixa reproduzível do catálogo.
 * Invariantes: título e artista não nulos; duração positiva.
 * Imutável: uma vez criada, o estado não muda (objeto de valor).
 */
public final class Musica implements Reproduzivel {

    private final String titulo;
    private final String artista;
    private final int duracaoSegundos;

    public Musica(String titulo, String artista, int duracaoSegundos) {
        if (titulo == null || titulo.isBlank()) {
            throw new IllegalArgumentException("título é obrigatório");
        }
        if (artista == null || artista.isBlank()) {
            throw new IllegalArgumentException("artista é obrigatório");
        }
        if (duracaoSegundos <= 0) {
            throw new IllegalArgumentException("duração deve ser positiva");
        }
        this.titulo = titulo;
        this.artista = artista;
        this.duracaoSegundos = duracaoSegundos;
    }

    public String getTitulo()          { return titulo; }
    public String getArtista()         { return artista; }
    public int getDuracaoSegundos()    { return duracaoSegundos; }

    @Override
    public int duracaoSegundos() { return duracaoSegundos; }

    @Override
    public String descricao() { return titulo + " — " + artista; }

    /** Duração no formato m:ss, calculada a partir do atributo (derivado, não guardado). */
    public String duracaoFormatada() {
        return String.format("%d:%02d", duracaoSegundos / 60, duracaoSegundos % 60);
    }

    /** Igualdade de conteúdo: mesma faixa de mesmo artista e duração. */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Musica m)) return false;
        return duracaoSegundos == m.duracaoSegundos
                && titulo.equals(m.titulo)
                && artista.equals(m.artista);
    }

    @Override
    public int hashCode() {
        return Objects.hash(titulo, artista, duracaoSegundos);
    }

    @Override
    public String toString() {
        return titulo + " — " + artista + " (" + duracaoFormatada() + ")";
    }
}
