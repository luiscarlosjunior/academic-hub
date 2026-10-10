package melodia;

/** Episódio de podcast: também é reproduzível, mas não tem álbum nem faixas. */
public class Podcast implements Reproduzivel {

    private final String titulo;
    private final String apresentador;
    private final int minutos;

    public Podcast(String titulo, String apresentador, int minutos) {
        if (minutos <= 0) throw new IllegalArgumentException("duração deve ser positiva");
        this.titulo = titulo;
        this.apresentador = apresentador;
        this.minutos = minutos;
    }

    @Override
    public int duracaoSegundos() { return minutos * 60; }

    @Override
    public String descricao() { return titulo + " — " + apresentador; }
}
