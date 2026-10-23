package exercicios.ex5;

/** Realização: Musica ..|> Reproduzivel. Vive no catálogo, fora das playlists. */
public class Musica implements Reproduzivel {
    private final String titulo;
    private final int duracao;

    public Musica(String titulo, int duracao) {
        this.titulo = titulo;
        this.duracao = duracao;
    }

    @Override
    public void tocar() { System.out.println("Tocando " + titulo); }
}
