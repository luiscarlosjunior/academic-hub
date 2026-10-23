package exercicios.ex1;

public class Playlist {
    private final String nome;

    // pacote: só o Ouvinte cria playlists
    Playlist(String nome) { this.nome = nome; }

    public String getNome() { return nome; }
}
