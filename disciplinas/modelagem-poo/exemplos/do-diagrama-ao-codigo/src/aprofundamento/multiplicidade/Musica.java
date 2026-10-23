package aprofundamento.multiplicidade;

public class Musica {
    private final String titulo;
    private final String artista;
    private final int duracaoSegundos;

    public Musica(String titulo, String artista, int duracaoSegundos) {
        this.titulo = titulo;
        this.artista = artista;
        this.duracaoSegundos = duracaoSegundos;
    }

    public String getTitulo() { return titulo; }
}
