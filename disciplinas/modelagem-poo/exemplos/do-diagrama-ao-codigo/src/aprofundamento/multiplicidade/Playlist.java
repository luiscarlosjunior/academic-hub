package aprofundamento.multiplicidade;

import java.util.*;

// Playlist "0..*" o-- "0..*" Musica   (agregação: a música vem de fora)
public class Playlist {
    private final List<Musica> musicas = new ArrayList<>();
    public void adicionar(Musica m) { musicas.add(m); }

    // acrescentado para a demonstração
    public int tamanho() { return musicas.size(); }
}
